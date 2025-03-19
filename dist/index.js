#!/usr/bin/env node

// src/index.ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { intro } from "@clack/prompts";
import chalk from "chalk";

// src/commands/addalias.ts
import { join as join2 } from "node:path";

// src/util/config.ts
import { homedir, platform } from "node:os";
import { join } from "node:path";
var getConfigFolder = () => {
  const os = platform();
  if (os == "darwin" || os == "linux") {
    const home = homedir() || process.env.HOME || `/home/${process.env.USER}`;
    const configFolder = "/.alias-manager-exerra";
    return join(home, configFolder);
  }
  if (os == "win32") {
    const local = process.env["LOCALAPPDATA"];
    return join(local, "alias-manager-exerra");
  } else
    return null;
};

// src/commands/addalias.ts
import fs from "node:fs";
import { existsSync, mkdirSync } from "node:fs";
import { log } from "@clack/prompts";
var addAliasCMD = (yarg) => {
  yarg.command("add [name] [command]", "Add a new alias", (yargs) => {
    return yargs.positional("name", {
      describe: "Name of the alias"
    }).positional("command", {
      describe: "Command that the alias will run"
    });
  }, (argv) => {
    const { name, command } = argv;
    const configFolder = getConfigFolder();
    if (!configFolder)
      return log.error("Invalid OS.");
    if (!existsSync(configFolder))
      mkdirSync(configFolder);
    if (!existsSync(join2(configFolder, "aliases.json")))
      fs.writeFileSync(join2(configFolder, "aliases.json"), JSON.stringify([]));
    const aliases = JSON.parse(fs.readFileSync(join2(configFolder, "aliases.json"), "utf-8"));
    for (let alias of aliases) {
      if (alias.name == name)
        return log.error("Alias with the same name already exists! Aborting...");
    }
    aliases.push({
      name,
      cmd: command,
      enabled: true
    });
    fs.writeFileSync(join2(configFolder, "aliases.json"), JSON.stringify(aliases));
    return log.success("Added alias! It is enabled by default.");
  });
};

// src/commands/link.ts
import { exec as execSync } from "node:child_process";
import fs2 from "fs";
import { existsSync as existsSync2, mkdirSync as mkdirSync2 } from "node:fs";
import { homedir as homedir2, platform as platform2 } from "node:os";
import { promisify } from "node:util";
import { join as join3 } from "node:path";
import { log as log2 } from "@clack/prompts";
var exec = promisify(execSync);
var linkAliases = (yarg) => {
  yarg.command("link", "Links/binds aliases to the shell. Must be run after adding/removing aliases in order to use them.", async (argv) => {
    const os = platform2();
    const configFolder = getConfigFolder();
    if (!configFolder)
      return log2.error("Invalid OS.");
    if (!existsSync2(configFolder))
      mkdirSync2(configFolder);
    if (!existsSync2(join3(configFolder, "aliases.json")))
      fs2.writeFileSync(join3(configFolder, "aliases.json"), JSON.stringify([]));
    const aliasesPreFiltering = JSON.parse(fs2.readFileSync(join3(configFolder, "aliases.json"), "utf-8"));
    const aliases = aliasesPreFiltering.filter((alias) => alias.enabled == true);
    log2.step(`Loading ${aliases.length} aliases.`);
    if (os == "darwin" || os == "linux") {
      const home = homedir2() || process.env.HOME || `/home/${process.env.USER}`;
      const shell = process.env.SHELL;
      let aliasFileContent = "";
      for (let { name, cmd } of aliases) {
        aliasFileContent += `alias ${name}="${cmd.replaceAll('"', "\\\"")}"
`;
      }
      fs2.writeFileSync(join3(configFolder, "aliases.sh"), aliasFileContent);
      let rcInclude = "source " + join3(configFolder, "aliases.sh");
      let rc = ".bashrc";
      let supported = true;
      switch (shell) {
        case "/bin/bash":
          rc = ".bashrc";
          break;
        case "/bin/zsh":
          rc = ".zshrc";
          break;
        default:
          supported = false;
      }
      if (!supported)
        return log2.error(`Shell not supported yet. Add this manually to your ~/.<shell>rc file:

` + rcInclude);
      let rcContent = fs2.readFileSync(join3(home, rc), "utf-8");
      if (rcContent.includes(rcInclude))
        return log2.success("Done! Restart your shell for the changes to take effect!");
      rcContent += `

` + rcInclude + `
`;
      fs2.writeFileSync(join3(home, rc), rcContent);
      return log2.success("Done! Restart your shell for the changes to take effect!");
    }
    if (os == "win32") {
      const user = homedir2() || process.env["USERPROFILE"];
      let aliasFileContent = "";
      for (let { name, cmd } of aliases) {
        aliasFileContent += `function ${name} { ${cmd} }
`;
      }
      fs2.writeFileSync(join3(configFolder, "aliases.ps1"), aliasFileContent);
      let { stdout: profilePath, stderr } = await exec(`powershell.exe -Command "$PROFILE"`);
      profilePath = profilePath.replace("\r", "").replace(`
`, "");
      let profilePathCheck = profilePath.replace(user, "");
      let profilePathArr = profilePathCheck.split("\\");
      let previousPath = user;
      for (let dir of profilePathArr) {
        if (dir == "")
          continue;
        if (dir.replace("\r", "").replace(`
`, "").endsWith(".ps1"))
          continue;
        if (!existsSync2(join3(previousPath, dir)))
          mkdirSync2(join3(previousPath, dir));
        previousPath = join3(previousPath, dir);
      }
      const profileExists = existsSync2(profilePath);
      let profile = "";
      if (profileExists)
        profile = fs2.readFileSync(profilePath, "utf-8");
      profile += `

. ${join3(configFolder, "aliases.ps1")}
`;
      fs2.writeFileSync(profilePath, profile);
      return log2.success("Done! Restart your shell for the changes to take effect!");
    }
  });
};

// src/commands/removealias.ts
import { join as join4 } from "node:path";
import fs3 from "node:fs";
import { existsSync as existsSync3, mkdirSync as mkdirSync3 } from "node:fs";
import { log as log3 } from "@clack/prompts";
var removeAliasCMD = (yarg) => {
  yarg.command("remove [name]", "Remove an alias by name", (yargs) => {
    return yargs.positional("name", {
      describe: "Name of the alias"
    });
  }, (argv) => {
    const { name } = argv;
    const configFolder = getConfigFolder();
    if (!configFolder)
      return log3.error("Invalid OS.");
    if (!existsSync3(configFolder))
      mkdirSync3(configFolder);
    if (!existsSync3(join4(configFolder, "aliases.json")))
      fs3.writeFileSync(join4(configFolder, "aliases.json"), JSON.stringify([]));
    const aliases = JSON.parse(fs3.readFileSync(join4(configFolder, "aliases.json"), "utf-8"));
    let filtered = aliases.filter((alias) => alias.name != name);
    fs3.writeFileSync(join4(configFolder, "aliases.json"), JSON.stringify(filtered));
    return log3.success("Removed alias!");
  });
};

// src/commands/listaliases.ts
import { join as join5 } from "node:path";
import fs4 from "node:fs";
import { existsSync as existsSync4, mkdirSync as mkdirSync4 } from "node:fs";
import Table from "cli-table";
import { log as log4 } from "@clack/prompts";
var listAliasesCMD = (yarg) => {
  yarg.command("list", "List all aliases", (yargs) => {
    return yargs;
  }, (argv) => {
    const configFolder = getConfigFolder();
    if (!configFolder)
      return log4.error("Invalid OS.");
    if (!existsSync4(configFolder))
      mkdirSync4(configFolder);
    if (!existsSync4(join5(configFolder, "aliases.json")))
      fs4.writeFileSync(join5(configFolder, "aliases.json"), JSON.stringify([]));
    const aliases = JSON.parse(fs4.readFileSync(join5(configFolder, "aliases.json"), "utf-8"));
    const table = new Table({
      head: ["Name", "Command", "Enabled?"]
    });
    for (let alias of aliases) {
      table.push([alias.name, alias.cmd, alias.enabled ? "Yes" : "No"]);
    }
    return log4.success(table.toString());
  });
};

// src/commands/enablealias.ts
import { join as join6 } from "node:path";
import fs5 from "node:fs";
import { existsSync as existsSync5, mkdirSync as mkdirSync5 } from "node:fs";
import { log as log5 } from "@clack/prompts";
var enableAliasCMD = (yarg) => {
  yarg.command("enable [name] [command]", "Enable an alias", (yargs) => {
    return yargs.positional("name", {
      describe: "Name of the alias"
    });
  }, (argv) => {
    const { name } = argv;
    const configFolder = getConfigFolder();
    if (!configFolder)
      return log5.error("Invalid OS.");
    if (!existsSync5(configFolder))
      mkdirSync5(configFolder);
    if (!existsSync5(join6(configFolder, "aliases.json")))
      fs5.writeFileSync(join6(configFolder, "aliases.json"), JSON.stringify([]));
    const aliases = JSON.parse(fs5.readFileSync(join6(configFolder, "aliases.json"), "utf-8"));
    let iToEnable = -1;
    for (let i in aliases) {
      const alias = aliases[i];
      if (alias.name == name)
        iToEnable = parseInt(i);
    }
    if (iToEnable == -1)
      return log5.error("Alias could not be found. Aborting...");
    aliases[iToEnable].enabled = true;
    fs5.writeFileSync(join6(configFolder, "aliases.json"), JSON.stringify(aliases));
    return log5.success("Enabled alias!");
  });
};

// src/commands/disablealias.ts
import { join as join7 } from "node:path";
import fs6 from "node:fs";
import { existsSync as existsSync6, mkdirSync as mkdirSync6 } from "node:fs";
import { log as log6 } from "@clack/prompts";
var disableAliasCMD = (yarg) => {
  yarg.command("disable [name] [command]", "Disable an alias", (yargs) => {
    return yargs.positional("name", {
      describe: "Name of the alias"
    });
  }, (argv) => {
    const { name } = argv;
    const configFolder = getConfigFolder();
    if (!configFolder)
      return log6.error("Invalid OS.");
    if (!existsSync6(configFolder))
      mkdirSync6(configFolder);
    if (!existsSync6(join7(configFolder, "aliases.json")))
      fs6.writeFileSync(join7(configFolder, "aliases.json"), JSON.stringify([]));
    let aliases = JSON.parse(fs6.readFileSync(join7(configFolder, "aliases.json"), "utf-8"));
    let iToDisable = -1;
    for (let i in aliases) {
      const alias = aliases[i];
      if (alias.name == name)
        iToDisable = parseInt(i);
    }
    if (iToDisable == -1)
      return log6.error("Alias could not be found. Aborting...");
    aliases[iToDisable].enabled = false;
    fs6.writeFileSync(join7(configFolder, "aliases.json"), JSON.stringify(aliases));
    return log6.success("Disabled alias!");
  });
};

// src/index.ts
var version = "0.0.1";
intro(`${chalk.bold.green("alias-manager")} ${chalk.gray("(v" + version + ")")} by ${chalk.bold("Exerra")}`);
var yarg = yargs(hideBin(process.argv));
addAliasCMD(yarg);
removeAliasCMD(yarg);
linkAliases(yarg);
listAliasesCMD(yarg);
enableAliasCMD(yarg);
disableAliasCMD(yarg);
yarg.scriptName("alias-manager");
yarg.example('$0 add v "open \\$1 -a \\"Visual Studio Code\\""', "");
yarg.help("h");
yarg.alias("h", "help");
yarg.parse();
