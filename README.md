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

## Installation

### Install from a VSIX File

1. Download or build `remote-vesta-opener-*.vsix`.
2. Open VS Code on the local machine where VESTA is installed.
3. Run `Extensions: Install from VSIX...` from the command palette.
4. Select the `.vsix` file.
5. Reload VS Code if prompted.

When you use VS Code Remote SSH, install this extension on the local VS Code side. The extension is configured as a UI extension so it can launch the local VESTA application while reading files from the remote workspace.

### Build and Install from Source

```bash
git clone https://github.com/yangjunlee/remoteVESTA.git
cd remoteVESTA
./package_manual_vsix.sh
```

Then install the generated `.vsix` file with:

```text
Extensions: Install from VSIX...
```

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

---

# Remote VESTA Opener 한국어 안내

Remote VESTA Opener는 원격 workspace에 있는 구조 파일을 로컬 VESTA 창에서 바로 열기 위한 작은 VS Code extension입니다.

주 사용 사례는 VS Code Remote SSH로 HPC 서버의 VASP 계산 결과를 확인하는 workflow입니다. `POSCAR`, `CONTCAR`, `.vasp`, `.cif` 파일을 매번 직접 다운로드하지 않고, extension이 선택한 원격 파일을 로컬 임시 폴더에 복사한 뒤 로컬 VESTA 실행 파일로 열어줍니다.

## 기능

- 현재 열려 있는 구조 파일을 로컬 VESTA로 열기
- VS Code Explorer에서 선택한 파일을 우클릭 메뉴로 열기
- VASP NEB image 디렉터리(`00`, `01`, `02`, ...)를 골라 `CONTCAR` 또는 `POSCAR` 열기
- `OSZICAR`가 있으면 NEB image 선택창에 최신 `E0` 값 표시
- 명령 팔레트에서 로컬 VESTA 실행 파일 경로 설정

## 필요 조건

- VS Code Remote SSH 또는 다른 remote filesystem provider
- 로컬 컴퓨터에 설치된 VESTA
- VESTA가 읽을 수 있는 구조 파일: `POSCAR`, `CONTCAR`, `.vasp`, `.cif`, `.xyz`, `.xsf`, `.cube`, `.pdb` 등

이 extension은 VS Code UI extension으로 동작해야 합니다. 그래야 파일은 원격 SSH workspace에 있어도, VESTA는 로컬 컴퓨터에서 실행할 수 있습니다.

## 설치 방법

### VSIX 파일로 설치

1. `remote-vesta-opener-*.vsix` 파일을 다운로드하거나 직접 생성합니다.
2. VESTA가 설치된 로컬 컴퓨터에서 VS Code를 엽니다.
3. 명령 팔레트에서 `Extensions: Install from VSIX...`를 실행합니다.
4. `.vsix` 파일을 선택합니다.
5. VS Code가 요청하면 reload합니다.

VS Code Remote SSH를 사용할 때도 이 extension은 로컬 VS Code 쪽에 설치하면 됩니다. 이 extension은 UI extension으로 설정되어 있어서, 원격 workspace의 파일을 읽으면서도 로컬 VESTA 프로그램을 실행할 수 있습니다.

### 소스에서 빌드 후 설치

```bash
git clone https://github.com/yangjunlee/remoteVESTA.git
cd remoteVESTA
./package_manual_vsix.sh
```

그 다음 생성된 `.vsix` 파일을 VS Code에서 다음 명령으로 설치합니다.

```text
Extensions: Install from VSIX...
```

## 명령

- `Remote VESTA: Open Active File`
- `Remote VESTA: Open in VESTA`
- `Remote VESTA: Pick NEB Image`
- `Remote VESTA: Configure VESTA Executable`

## 설정

```json
{
  "remoteVesta.executablePath": "",
  "remoteVesta.tempDirectory": "",
  "remoteVesta.keepTempFiles": true
}
```

자주 쓰는 VESTA 실행 파일 경로:

- macOS: `/Applications/VESTA.app/Contents/MacOS/VESTA`
- Windows: `C:\\Program Files\\VESTA-win64\\VESTA.exe`
- Linux: `/usr/local/bin/VESTA`

`remoteVesta.executablePath`가 비어 있으면 extension은 몇 가지 흔한 경로와 `PATH`의 `VESTA`를 시도합니다.

## 사용법

### 단일 구조 파일 열기

1. VS Code에서 원격 workspace를 엽니다.
2. `CONTCAR` 같은 구조 파일을 선택하거나 엽니다.
3. `Remote VESTA: Open Active File`을 실행하거나, 파일을 우클릭해서 `Remote VESTA: Open in VESTA`를 선택합니다.

선택한 파일은 로컬 임시 cache로 복사되고, 로컬 VESTA에서 열립니다.

### NEB image 열기

VASP NEB 디렉터리가 다음처럼 구성되어 있다고 가정합니다.

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

`neb_run` 폴더를 우클릭하고 다음 명령을 실행합니다.

```text
Remote VESTA: Pick NEB Image
```

숫자로 된 image 폴더들이 목록에 표시됩니다. 각 image에 `OSZICAR`가 있으면 최신 `E0` 값도 함께 표시됩니다.

## 개발

```bash
npm run check
```

대화형 테스트는 VS Code에서 이 폴더를 열고 `F5`를 눌러 Extension Development Host를 실행하면 됩니다.

## 패키징

`vsce`를 사용할 수 있다면:

```bash
npx @vscode/vsce package
```

최소 환경을 위한 수동 VSIX 패키징 스크립트도 포함되어 있습니다.

```bash
./package_manual_vsix.sh
```

생성된 `.vsix` 파일은 VS Code에서 다음 명령으로 설치할 수 있습니다.

```text
Extensions: Install from VSIX...
```

## 참고

- VESTA 실행 후에도 파일을 계속 읽을 수 있도록, 복사된 로컬 파일은 기본적으로 유지됩니다.
- 이 extension은 원격 구조 파일을 수정하지 않습니다.
- 현재 NEB picker는 `CONTCAR`와 `POSCAR`가 모두 있으면 `CONTCAR`를 우선합니다.
