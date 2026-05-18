const vscode = require('vscode');
const childProcess = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const SUPPORTED_NAMES = new Set([
  'POSCAR',
  'CONTCAR',
  'XDATCAR',
  'CHGCAR'
]);

const SUPPORTED_EXTENSIONS = new Set([
  '.vasp',
  '.poscar',
  '.contcar',
  '.cif',
  '.xyz',
  '.xsf',
  '.cube',
  '.pdb'
]);

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('remoteVesta.openActiveFile', openActiveFile),
    vscode.commands.registerCommand('remoteVesta.openResource', openResource),
    vscode.commands.registerCommand('remoteVesta.openNebImage', openNebImage),
    vscode.commands.registerCommand('remoteVesta.configureExecutable', configureExecutable)
  );
}

function deactivate() {}

async function openActiveFile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor to open in VESTA.');
    return;
  }
  await openUri(editor.document.uri);
}

async function openResource(resource) {
  if (resource && resource.scheme) {
    await openUri(resource);
    return;
  }
  await openActiveFile();
}

async function openNebImage(resource) {
  const root = await resolveNebRoot(resource);
  if (!root) {
    vscode.window.showWarningMessage('Select a NEB run folder or a file inside one.');
    return;
  }

  const images = await listNebImages(root);
  if (images.length === 0) {
    vscode.window.showWarningMessage('No numeric NEB image directories found.');
    return;
  }

  const picked = await vscode.window.showQuickPick(images, {
    title: 'Open NEB image in local VESTA',
    placeHolder: 'Choose 00, 01, ...'
  });
  if (!picked) {
    return;
  }
  await openUri(picked.uri);
}

async function openUri(uri) {
  if (!uri) {
    vscode.window.showWarningMessage('No file selected.');
    return;
  }
  if (uri.scheme === 'untitled') {
    vscode.window.showWarningMessage('Save the file before opening it in VESTA.');
    return;
  }

  const baseName = path.basename(uri.path);
  if (!looksLikeStructureFile(baseName)) {
    const answer = await vscode.window.showWarningMessage(
      `${baseName} does not look like a structure file. Open it in VESTA anyway?`,
      'Open',
      'Cancel'
    );
    if (answer !== 'Open') {
      return;
    }
  }

  const localPath = await copyToLocalCache(uri);
  const executable = await resolveVestaExecutable();
  if (!executable) {
    await configureExecutable();
    return;
  }

  launchVesta(executable, localPath);
  vscode.window.showInformationMessage(`Opened ${baseName} in VESTA.`);
}

async function resolveNebRoot(resource) {
  let uri = resource && resource.scheme ? resource : undefined;
  if (!uri && vscode.window.activeTextEditor) {
    uri = vscode.window.activeTextEditor.document.uri;
  }
  if (!uri) {
    return undefined;
  }

  const stat = await safeStat(uri);
  if (stat && stat.type === vscode.FileType.Directory) {
    return uri;
  }

  const fileName = path.basename(uri.path);
  const parent = vscode.Uri.joinPath(uri, '..');
  if (/^\d+$/.test(path.basename(parent.path))) {
    return vscode.Uri.joinPath(parent, '..');
  }
  if (SUPPORTED_NAMES.has(fileName) || SUPPORTED_EXTENSIONS.has(path.extname(fileName).toLowerCase())) {
    return parent;
  }
  return parent;
}

async function listNebImages(root) {
  const entries = await vscode.workspace.fs.readDirectory(root);
  const imageNames = entries
    .filter((entry) => entry[1] === vscode.FileType.Directory && /^\d+$/.test(entry[0]))
    .map((entry) => entry[0])
    .sort();

  const images = [];
  for (const name of imageNames) {
    const imageDir = vscode.Uri.joinPath(root, name);
    const structure = await firstExistingUri(imageDir, ['CONTCAR', 'POSCAR']);
    if (!structure) {
      continue;
    }
    const energy = await readLastE0(vscode.Uri.joinPath(imageDir, 'OSZICAR'));
    images.push({
      label: name,
      description: path.basename(structure.path),
      detail: energy === undefined ? structure.path : `E0 = ${energy.toFixed(8)} eV`,
      uri: structure
    });
  }
  return images;
}

async function firstExistingUri(base, names) {
  for (const name of names) {
    const uri = vscode.Uri.joinPath(base, name);
    const stat = await safeStat(uri);
    if (stat && stat.type === vscode.FileType.File && stat.size > 0) {
      return uri;
    }
  }
  return undefined;
}

async function safeStat(uri) {
  try {
    return await vscode.workspace.fs.stat(uri);
  } catch (_error) {
    return undefined;
  }
}

async function readLastE0(uri) {
  try {
    const bytes = await vscode.workspace.fs.readFile(uri);
    const text = Buffer.from(bytes).toString('utf8');
    let value;
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/\bE0=\s*([-+0-9.EDed]+)/);
      if (match) {
        value = Number(match[1].replace(/[Dd]/g, 'E'));
      }
    }
    return Number.isFinite(value) ? value : undefined;
  } catch (_error) {
    return undefined;
  }
}

function looksLikeStructureFile(fileName) {
  if (SUPPORTED_NAMES.has(fileName)) {
    return true;
  }
  return SUPPORTED_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

async function copyToLocalCache(uri) {
  const bytes = await vscode.workspace.fs.readFile(uri);
  const config = vscode.workspace.getConfiguration('remoteVesta');
  const configuredTemp = config.get('tempDirectory', '');
  const root = configuredTemp || path.join(os.tmpdir(), 'remote-vesta-opener');
  fs.mkdirSync(root, { recursive: true });

  const sourceKey = `${uri.scheme}:${uri.authority}:${uri.path}`;
  const digest = crypto.createHash('sha1').update(sourceKey).digest('hex').slice(0, 10);
  const originalName = sanitizeFileName(path.basename(uri.path) || 'structure.vasp');
  const extension = path.extname(originalName) || '.vasp';
  const stem = path.basename(originalName, extension);
  const localName = `${stem}_${digest}${extension}`;
  const localPath = path.join(root, localName);

  fs.writeFileSync(localPath, Buffer.from(bytes));
  return localPath;
}

function sanitizeFileName(value) {
  return value.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
}

async function resolveVestaExecutable() {
  const config = vscode.workspace.getConfiguration('remoteVesta');
  const configured = config.get('executablePath', '');
  if (configured && fs.existsSync(configured)) {
    return configured;
  }

  for (const candidate of defaultExecutableCandidates()) {
    if (candidate === 'VESTA' || fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return '';
}

function defaultExecutableCandidates() {
  if (process.platform === 'darwin') {
    return [
      '/Applications/VESTA.app/Contents/MacOS/VESTA',
      'VESTA'
    ];
  }
  if (process.platform === 'win32') {
    return [
      'C:\\Program Files\\VESTA-win64\\VESTA.exe',
      'C:\\Program Files\\VESTA\\VESTA.exe',
      'VESTA.exe'
    ];
  }
  return [
    '/usr/local/bin/VESTA',
    '/usr/bin/VESTA',
    'VESTA'
  ];
}

function launchVesta(executable, structurePath) {
  const child = childProcess.spawn(executable, [structurePath], {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();
}

async function configureExecutable() {
  const config = vscode.workspace.getConfiguration('remoteVesta');
  const current = config.get('executablePath', '');
  const input = await vscode.window.showInputBox({
    title: 'Path to local VESTA executable',
    prompt: executablePrompt(),
    value: current
  });
  if (!input) {
    return;
  }
  await config.update('executablePath', input, vscode.ConfigurationTarget.Global);
  vscode.window.showInformationMessage(`Remote VESTA executable set to ${input}`);
}

function executablePrompt() {
  if (process.platform === 'darwin') {
    return 'Example: /Applications/VESTA.app/Contents/MacOS/VESTA';
  }
  if (process.platform === 'win32') {
    return 'Example: C:\\Program Files\\VESTA-win64\\VESTA.exe';
  }
  return 'Example: /usr/local/bin/VESTA';
}

module.exports = {
  activate,
  deactivate
};
