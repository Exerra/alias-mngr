import { join } from "node:path"
import { Yarg } from "../types/yarg"
import { getConfigFolder } from "../util/config"
import fs from "node:fs"
import { existsSync, mkdirSync } from "node:fs"
import { Aliases } from "../types/aliases"
import { log } from "@clack/prompts"

export const removeAliasCMD = (yarg) => {
    yarg.command("remove [name]", "Remove an alias by name", (yargs) => {
        return yargs
            .positional("name", {
                describe: "Name of the alias"
            })
    }, (argv) => {
        const { name } = argv
        const configFolder = getConfigFolder()
        
        if (!configFolder) return log.error("Invalid OS.")

        if (!existsSync(configFolder)) mkdirSync(configFolder)

        if (!existsSync(join(configFolder, "aliases.json"))) fs.writeFileSync(join(configFolder, "aliases.json"), JSON.stringify([]))

        const aliases = JSON.parse(fs.readFileSync(join(configFolder, "aliases.json"), "utf-8")) as Aliases

        let filtered = aliases.filter(alias => alias.name != name)

        fs.writeFileSync(join(configFolder, "aliases.json"), JSON.stringify(filtered))

        return log.success("Removed alias!")
    })
}