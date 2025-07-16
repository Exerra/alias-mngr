import { join } from "node:path"
import { Yarg } from "../types/yarg"
import { ensureConfigFolder } from "../util/config"
import fs from "node:fs"
import { existsSync } from "node:fs"
import { Aliases } from "../types/aliases"
import { log } from "@clack/prompts"

export const enableAliasCMD = (yarg: Yarg) => {
    yarg.command("enable [name] [command]", "Enable an alias", (yargs) => {
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

        let iToEnable = -1

        for (let i in aliases) {
            const alias = aliases[i]

            if (alias.name === name) {
                iToEnable = parseInt(i)
                break
            }
        }

        if (iToEnable === -1) return log.error("Alias could not be found. Aborting...")

        if (aliases[iToEnable].enabled) {
            return log.info("Alias is already enabled!")
        }

        aliases[iToEnable].enabled = true

        fs.writeFileSync(aliasesFile, JSON.stringify(aliases))

        return log.success("Enabled alias!")
    })
}