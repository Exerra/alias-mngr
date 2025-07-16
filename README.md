# alias-mngr
CLI utility for managing shell aliases. Cross-platform with full Windows support.

## Features

- **Cross-platform**: Works on Windows, macOS, and Linux
- **Automatic shell detection**: Detects your shell and configures aliases accordingly
- **Multiple shell support**: Bash, Zsh, Fish, PowerShell, Csh/Tcsh, Ksh
- **Robust PowerShell support**: Works with both PowerShell 5.1 and PowerShell Core
- **Safe configuration**: Creates config files in appropriate directories per platform

## Install
I am working on publishing this on NPM. In the meantime you can grab a bundled JS file from the [Releases](https://github.com/Exerra/alias-manager/releases) section. When running it that way, substitute `alias-mngr` with `node alias-mngr.js`.

## Usage

You can view the help page by running `alias-mngr -h`.

> [!IMPORTANT]
> Changes to the aliases (adding/removing/enabling/disabling) do not immediately get synced to the shell. They have to be linked/binded by running `alias-mngr link`.

When adding aliases that take inputs ($1, $2, etc) make sure to escape them, otherwise the shell will pass the input not as a string (`"$1"`), but prefill it.
Example: `alias-mngr add v "open \$1 -a \"Visual Studio Code\""`

### Windows

The tool now has full Windows support with automatic PowerShell detection. It will:
- Detect whether you're using PowerShell 5.1 or PowerShell Core (pwsh)
- Create the PowerShell profile directory if it doesn't exist
- Handle profile paths correctly across different Windows versions

> [!NOTE]
> If you encounter execution policy issues, you may need to run:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```
> This is safer than using `Bypass` and only affects the current user.

## TODO
- [ ] Support for more shells

## Supported shells

| Shell                  | Supported? | Comment                                                                                                                                                               |
| ---------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bash                   | ✅          | Full support with automatic detection                                                                                                                                 |
| Zsh                    | ✅          | Full support with automatic detection                                                                                                                                 |
| Fish                   | ✅          | Full support with automatic detection and Fish-specific syntax                                                                                                        |
| Csh/Tcsh               | ✅          | Basic support with automatic detection                                                                                                                                |
| Ksh                    | ✅          | Basic support with automatic detection                                                                                                                                |
| PowerShell             | ✅          | Full support with automatic detection. Works with both PowerShell 5.1 and PowerShell Core (pwsh)                                                                   |
| Command Prompt         | ❌          | Not supported (use PowerShell instead)                                                                                                                               |
| Anything not mentioned | ❌          | If you have a shell you wish to be supported, you can create an issue or code it yourself & make a PR :)                                                              |
