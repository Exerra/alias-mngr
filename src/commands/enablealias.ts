import { join } from "node:path"
import { Yarg } from "../types/yarg"
import { getConfigFolder } from "../util/config"
import fs from "node:fs"
import { existsSync, mkdirSync } from "node:fs"
import { Aliases } from "../types/aliases"
import { log } from "@clack/prompts"

export const enableAliasCMD = (yarg) => {
    yarg.command("enable [name] [command]", "Enable an alias", (yargs) => {
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

        let iToEnable = -1

        for (let i in aliases) {
            const alias = aliases[i]

            if (alias.name == name) iToEnable = parseInt(i)
        }

        if (iToEnable == -1) return log.error("Alias could not be found. Aborting...")

        aliases[iToEnable].enabled = true

        fs.writeFileSync(join(configFolder, "aliases.json"), JSON.stringify(aliases))

        return log.success("Enabled alias!")
    })
}