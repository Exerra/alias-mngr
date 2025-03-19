#!/usr/bin/env node
// ! need to figure out how to change this to node for the export

import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { cancel, group, intro, outro, select, text, confirm, spinner, log } from "@clack/prompts";
import chalk from "chalk";
import { addAliasCMD } from "./commands/addalias";
import { linkAliases } from "./commands/link";
import { removeAliasCMD } from "./commands/removealias";
import { listAliasesCMD } from "./commands/listaliases";
import { enableAliasCMD } from "./commands/enablealias";
import { disableAliasCMD } from "./commands/disablealias";

const version = "0.0.1"

intro(`${chalk.bold.green("alias-manager")} ${chalk.gray("(v" + version + ")")} by ${chalk.bold("Exerra")}`)

let yarg = yargs(hideBin(process.argv))

addAliasCMD(yarg)
removeAliasCMD(yarg)
linkAliases(yarg)
listAliasesCMD(yarg)

enableAliasCMD(yarg)
disableAliasCMD(yarg)

yarg.scriptName("alias-manager")
yarg.example('$0 add v "open \\$1 -a \\"Visual Studio Code\\""', "")
yarg.help("h")
yarg.alias("h", "help")//.alias("h", "")
yarg.parse()
// yarg.argv