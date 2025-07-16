import { join } from "node:path"
import { Yarg } from "../types/yarg"
import { ensureConfigFolder } from "../util/config"
import fs from "node:fs"
import { existsSync } from "node:fs"
import { Aliases } from "../types/aliases"
import { log } from "@clack/prompts"

export const removeAliasCMD = (yarg: Yarg) => {
    yarg.command("remove [name]", "Remove an alias by name", (yargs) => {
        return yargs
            .positional("name", {
                describe: "Name of the alias"
            })
    }, (argv) => {
        const { name } = argv
        
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

        const filtered = aliases.filter(alias => alias.name !== name)

        if (filtered.length === aliases.length) {
            return log.error(`Alias '${name}' not found!`)
        }

        fs.writeFileSync(aliasesFile, JSON.stringify(filtered))

        return log.success("Removed alias!")
    })
}