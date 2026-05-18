# Remote VESTA Opener

Remote VESTA Opener is a small VS Code extension for opening structure files from a remote workspace in a local VESTA window.

It is intended for workflows such as VASP calculations on an HPC cluster through VS Code Remote SSH. Instead of manually downloading `POSCAR`, `CONTCAR`, `.vasp`, or `.cif` files, the extension copies the selected remote file to a local temporary directory and launches the local VESTA executable.

## Features

- Open the active structure file in local VESTA.
- Open a selected file from the VS Code Explorer context menu.
- Pick a VASP NEB image directory (`00`, `01`, `02`, ...) and open its `CONTCAR` or `POSCAR`.
- Show the latest `E0` value from `OSZICAR` in the NEB image picker when available.
- Configure the local VESTA executable path from the command palette.

## Requirements

- VS Code with Remote SSH or another remote filesystem provider.
- VESTA installed on the local machine where the VS Code UI is running.
- A structure file supported by VESTA, such as `POSCAR`, `CONTCAR`, `.vasp`, `.cif`, `.xyz`, `.xsf`, `.cube`, or `.pdb`.

This extension should run as a VS Code UI extension. That is what allows it to launch the local VESTA application even when the file is stored in a remote SSH workspace.

## Commands

- `Remote VESTA: Open Active File`
- `Remote VESTA: Open in VESTA`
- `Remote VESTA: Pick NEB Image`
- `Remote VESTA: Configure VESTA Executable`

## Configuration

```json
{
  "remoteVesta.executablePath": "",
  "remoteVesta.tempDirectory": "",
  "remoteVesta.keepTempFiles": true
}
```

Common VESTA executable paths:

- macOS: `/Applications/VESTA.app/Contents/MacOS/VESTA`
- Windows: `C:\\Program Files\\VESTA-win64\\VESTA.exe`
- Linux: `/usr/local/bin/VESTA`

If `remoteVesta.executablePath` is empty, the extension tries a few common paths and `VESTA` from `PATH`.

## Usage

### Open a Single File

1. Open a remote workspace in VS Code.
2. Select or open a structure file such as `CONTCAR`.
3. Run `Remote VESTA: Open Active File`, or right-click the file and choose `Remote VESTA: Open in VESTA`.

The file is copied to a local temporary cache and opened with local VESTA.

### Open a NEB Image

For a VASP NEB directory such as:

```text
neb_run/
  00/POSCAR
  01/CONTCAR
  02/CONTCAR
  03/CONTCAR
  04/CONTCAR
  05/CONTCAR
  06/POSCAR
```

Right-click `neb_run` and run:

```text
Remote VESTA: Pick NEB Image
```

The image picker lists numeric image folders. If an image contains `OSZICAR`, the latest `E0` value is shown in the picker.

## Development

```bash
npm run check
```

For interactive testing, open this folder in VS Code and press `F5` to launch an Extension Development Host.

## Packaging

If `vsce` is available:

```bash
npx @vscode/vsce package
```

A manual VSIX packager is also included for minimal environments:

```bash
./package_manual_vsix.sh
```

The generated `.vsix` can be installed with:

```text
Extensions: Install from VSIX...
```

## Notes

- The copied local file is intentionally kept by default so VESTA can continue reading it after launch.
- The extension does not modify the remote structure file.
- The current NEB picker prefers `CONTCAR` over `POSCAR` when both are present.
