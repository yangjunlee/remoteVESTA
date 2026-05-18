# Remote VESTA Opener

VSCode Remote SSH에서 보고 있는 원격 `POSCAR`, `CONTCAR`, `.vasp`, `.cif` 파일을 로컬 VESTA로 여는 작은 VSCode extension입니다.

## Idea

VSCode extension을 `extensionKind: ["ui"]`로 두면 Remote SSH workspace에서도 extension code가 로컬 VSCode UI 쪽에서 실행됩니다. 그러면 extension이 원격 파일은 VSCode filesystem API로 읽고, 로컬 임시 폴더에 저장한 뒤, 로컬 VESTA 실행 파일을 띄울 수 있습니다.

즉 매번 수동 다운로드하지 않고:

1. VSCode Remote SSH에서 `CONTCAR` 또는 `POSCAR` 선택
2. 우클릭 `Remote VESTA: Open in VESTA`
3. 로컬 VESTA가 해당 구조를 열기

가 목표입니다.

## Current Commands

- `Remote VESTA: Open Active File`
- `Remote VESTA: Open in VESTA`
- `Remote VESTA: Pick NEB Image`
- `Remote VESTA: Configure VESTA Executable`

## Settings

```json
{
  "remoteVesta.executablePath": "",
  "remoteVesta.tempDirectory": "",
  "remoteVesta.keepTempFiles": true
}
```

Recommended executable paths:

- macOS: `/Applications/VESTA.app/Contents/MacOS/VESTA`
- Windows: `C:\\Program Files\\VESTA-win64\\VESTA.exe`
- Linux: `/usr/local/bin/VESTA`

## Development Test

```bash
cd /home/yjlee/neb_prac/remote_vesta_opener
npm run check
```

## Manual VSIX Packaging on This Server

The server currently has Node 16, while recent `vsce` versions require newer Node. Use the manual packager instead:

```bash
cd /home/yjlee/neb_prac/remote_vesta_opener
./package_manual_vsix.sh
```

It creates:

```bash
/home/yjlee/neb_prac/remote_vesta_opener/remote-vesta-opener-0.1.0.vsix
```

Install it from local VSCode with `Extensions: Install from VSIX...`.

To test interactively, open this folder in VSCode and press `F5` to launch an Extension Development Host. In the dev host, connect to the remote workspace or open a remote file, then run `Remote VESTA: Open Active File`.

For NEB runs, right-click the run folder or a file inside it and run `Remote VESTA: Pick NEB Image`. It lists numeric image folders and shows `E0` when `OSZICAR` is available.

## Roadmap

- Add a command to open all NEB images in order.
- Add cache cleanup.
- Add optional conversion to `.vasp` file names for extensionless `POSCAR`/`CONTCAR`.
- Add a small status panel showing copied local paths.
