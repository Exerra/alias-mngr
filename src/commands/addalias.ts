import { join } from "node:path"
import { Yarg } from "../types/yarg"
import { ensureConfigFolder } from "../util/config"
import fs from "node:fs"
import { existsSync } from "node:fs"
import { Aliases } from "../types/aliases"
import { confirm, log, text } from "@clack/prompts"
import chalk from "chalk"

export const addAliasCMD = (yarg: Yarg) => {
    yarg.command("add [name] [command]", "Add a new alias", (yargs) => {
        return yargs
            .positional("name", {
                describe: "Name of the alias"
            })
            .positional("command", {
                describe: "Command that the alias will run"
            })
    }, async (argv) => {
        let { name, command } = argv as { name: string, command: string }
        
        let configFolder: string
        try {
            configFolder = ensureConfigFolder()
        } catch (error) {
            return log.error(`Failed to setup config folder: ${error}`)
        }

        const aliasesFile = join(configFolder, "aliases.json")
        if (!existsSync(aliasesFile)) {
            fs.writeFileSync(aliasesFile, JSON.stringify([]))
        }

        const aliases = JSON.parse(fs.readFileSync(aliasesFile, "utf-8")) as Aliases

        for (let alias of aliases) {
            if (alias.name === name) {
                return log.error("Alias with the same name already exists! Aborting...")
            }
        }

        // example: alias-mngr add py python3.11 testing.py
        // Without this, command would just be python3.11
        // This combines everything after alias-mngr add
        if (argv["_"].length > 1) {
            const joined = argv["_"].filter(arg => arg !== "add").join(" ")
            command = command + " " + joined
        }

        const confirmed = await confirm({
            message: `Looks good? Name: ${chalk.gray(name)}, command: ${chalk.gray(command)}`
        })

        if (!confirmed) return log.error("Aborting!")
        if (typeof confirmed === "symbol") {
            if (confirmed.description === "clack:cancel") return log.error("Aborting!")
        }

        aliases.push({
            name: name,
            cmd: command,
            enabled: true
        })

        fs.writeFileSync(aliasesFile, JSON.stringify(aliases))

        return log.success(`Added alias! It is enabled by default. Run the following command to activate it - ${chalk.grey("alias-mngr link")}.`)
    })
}