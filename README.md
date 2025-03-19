# alias-mngr
CLI utility for managing shell aliases. Cross-platform, experimental Windows support.

## Install
I am working on publishing this on NPM. In the meantime you can grab a bundled JS file from the [Releases](https://github.com/Exerra/alias-manager/releases) section. When running it that way, substitute `alias-mngr` with `node alias-mngr.js`.

## Usage

You can view the help page by running `alias-mngr -h`.

Changes to the aliases (adding/removing/enabling/disabling) do not immediately get synced to the shell. They have to be linked/binded by running `alias-mngr link`.

When adding aliases that take inputs ($1, $2, etc) make sure to escape them, otherwise the shell will pass the input not as a string (`"$1"`), but prefill it.
Example: `alias-mngr add v "open \$1 -a \"Visual Studio Code\""`
