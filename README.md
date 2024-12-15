<h1><img src="./public/knoto.svg" alt="logo" width="80" align="center"/>&nbsp;&nbsp;&nbsp;knoto</h1>

coming soon...

### Prerequisites
- **rust (tauri runtime)**

    for macOS use [homebrew](https://brew.sh/)
    ```bash
    brew install rustup
    ```
    for windows use [scoop](https://scoop.sh/)
    ```bash
    scoop install main/rustup
    ```
    this project was built using rust 1.82.0, feel free to try newer stable versions
    ```bash
    rustup install 1.82.0
    rustup default 1.82.0
    ```
    for more in-depth OS specific information refer to the [tauri docs](https://tauri.app/start/prerequisites/)

- **node (frontend runtime)**

    for macOS use [homebrew](https://brew.sh/)
    ```bash
    brew install node
    brew install pnpm
    ```
    for windows use [scoop](https://scoop.sh/)
    ```bash
    scoop install main/nodejs-lts
    scoop install nodejs-lts pnpm
    ```


- **python (backend runtime)**

    for macOS use [homebrew](https://brew.sh/)
    ```bash
    brew install python@3.12
    ```
    for windows use [scoop](https://scoop.sh/)
    ```bash
    scoop install python@3.12
    ```

- **poetry (py env management)**

    it is remommended to use `pipx` to install `poetry`

    `pipx`

    for macOS use [homebrew](https://brew.sh/)
    ```bash
    brew install pipx
    pipx ensurepath
    ```
    for windows use [scoop](https://scoop.sh/)
    ```bash
    scoop install pipx
    pipx ensurepath
    ```

    `poetry`

    ```bash
    pipx install poetry
    ```

### Installation

- **required**

    create the python env and install the dependencies
    ```bash
    poetry install
    ```
    download the frontend dependencies
    ```bash
    pnpm install
    ````

### Debugging
Be aware that even though running the `dev command` will put executable files into the `./src-tauri/target/debug` directory, these artifacts cannot be run.
To generate an actual usable debug build in that location, run the `debug-build` command first. For more information on debugging in Tauri in general refer to the [tauri docs](https://tauri.app/develop/debug/).
