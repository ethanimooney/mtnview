#!/usr/bin/env node
/* Build an installable LG webOS .ipk package (pure Node ar + tar.gz, no Xcode tools needed). */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const appDir = path.join(root, 'app');
const distDir = path.join(root, 'dist');
const appinfo = JSON.parse(fs.readFileSync(path.join(appDir, 'appinfo.json'), 'utf8'));
const appId = appinfo.id;
const version = appinfo.version || '1.0.0';
const outIpk = path.join(distDir, `${appId}_${version}_all.ipk`);

const workDir = path.join(distDir, '.ipk-build');
const dataRoot = path.join(workDir, 'data');
const appTarget = path.join(dataRoot, 'usr', 'palm', 'applications', appId);
const controlRoot = path.join(workDir, 'control');

fs.rmSync(workDir, { recursive: true, force: true });
fs.mkdirSync(appTarget, { recursive: true });
fs.mkdirSync(controlRoot, { recursive: true });

function isRuntimeSource(rel) {
  if (rel === 'config.xml' || rel === 'grid.css' || rel === 'optics.js' || rel === '.DS_Store' || rel.endsWith('/.DS_Store')) return false;
  if (rel.startsWith('assets/grid/') || rel.startsWith('assets/vendor/') || rel.startsWith('assets/aerials/') || rel.startsWith('assets/materials/') || rel.startsWith('assets/fonts/')) return false;
  if (rel === 'assets/typefaces.css' || rel === 'assets/private-fonts.css') return false;
  if (/^assets\/wallpapers\/.+\.(jpg|png)$/.test(rel)) return false;
  return true;
}

let installedBytes = 0;
function copyTree(srcDir, relBase = '') {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
    const fullSrc = path.join(srcDir, entry.name);
    if (entry.isDirectory()) {
      copyTree(fullSrc, rel);
    } else if (entry.isFile() && isRuntimeSource(rel)) {
      const fullDst = path.join(appTarget, rel);
      fs.mkdirSync(path.dirname(fullDst), { recursive: true });
      fs.copyFileSync(fullSrc, fullDst);
      installedBytes += fs.statSync(fullSrc).size;
    }
  }
}

copyTree(appDir);

const controlText = [
  `Package: ${appId}`,
  `Version: ${version}`,
  'Section: misc',
  'Priority: optional',
  'Architecture: all',
  `Installed-Size: ${installedBytes}`,
  `Maintainer: ${appinfo.vendor || 'mtnview'} <noreply@mtnview.local>`,
  `Description: ${appinfo.title || 'mtnview'} launcher for LG webOS`,
  'webOS-Package-Format-Version: 2',
  'webOS-Packager-Version: 1.0.0',
  ''
].join('\n');
fs.writeFileSync(path.join(controlRoot, 'control'), controlText);

const controlTar = path.join(workDir, 'control.tar.gz');
const dataTar = path.join(workDir, 'data.tar.gz');
const tarEnv = { ...process.env, COPYFILE_DISABLE: '1' };
execFileSync('tar', ['-czf', controlTar, '-C', controlRoot, './control'], { env: tarEnv });
execFileSync('tar', ['-czf', dataTar, '-C', dataRoot, './usr'], { env: tarEnv });

function arMember(name, data) {
  const mtime = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    name.padEnd(16, ' ') +
    String(mtime).padEnd(12, ' ') +
    '0'.padEnd(6, ' ') +
    '0'.padEnd(6, ' ') +
    '100644'.padEnd(8, ' ') +
    String(data.length).padEnd(10, ' ') +
    '`\n',
    'ascii'
  );
  if (header.length !== 60) throw new Error('Invalid ar header length');
  const pad = data.length % 2 === 1 ? Buffer.from('\n', 'ascii') : Buffer.alloc(0);
  return Buffer.concat([header, data, pad]);
}

const debianBinary = Buffer.from('2.0\n', 'ascii');
const arBuffer = Buffer.concat([
  Buffer.from('!<arch>\n', 'ascii'),
  arMember('debian-binary', debianBinary),
  arMember('control.tar.gz', fs.readFileSync(controlTar)),
  arMember('data.tar.gz', fs.readFileSync(dataTar))
]);

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(outIpk, arBuffer);
fs.rmSync(workDir, { recursive: true, force: true });

console.log(`Built LG webOS package: ${outIpk} (${Math.round(arBuffer.length / 1024)} KB)`);
