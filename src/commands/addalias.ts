import { join } from "node:path"
import { Yarg } from "../types/yarg"
import { getConfigFolder } from "../util/config"
import fs from "node:fs"
import { existsSync, mkdirSync } from "node:fs"
import { Aliases } from "../types/aliases"
import { log, text } from "@clack/prompts"

export const addAliasCMD = (yarg) => {
    yarg.command("add [name] [command]", "Add a new alias", (yargs) => {
        return yargs
            .positional("name", {
                describe: "Name of the alias"
            })
            .positional("command", {
                describe: "Command that the alias will run"
            })
    }, (argv) => {
        const { name, command } = argv
        const configFolder = getConfigFolder()
        
        if (!configFolder) return log.error("Invalid OS.")

        if (!existsSync(configFolder)) mkdirSync(configFolder)

        if (!existsSync(join(configFolder, "aliases.json"))) fs.writeFileSync(join(configFolder, "aliases.json"), JSON.stringify([]))

        const aliases = JSON.parse(fs.readFileSync(join(configFolder, "aliases.json"), "utf-8")) as Aliases

        for (let alias of aliases) {
            if (alias.name == name) return log.error("Alias with the same name already exists! Aborting...")
        }

        aliases.push({
            name: name,
            cmd: command,
            enabled: true
        })

        fs.writeFileSync(join(configFolder, "aliases.json"), JSON.stringify(aliases))

        return log.success("Added alias! It is enabled by default.")
    })
}