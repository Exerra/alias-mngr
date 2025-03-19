import { join } from "node:path"
import { Yarg } from "../types/yarg"
import { getConfigFolder } from "../util/config"
import fs from "node:fs"
import { existsSync, mkdirSync } from "node:fs"
import { Aliases } from "../types/aliases"
import { log } from "@clack/prompts"

export const disableAliasCMD = (yarg) => {
    yarg.command("disable [name] [command]", "Disable an alias", (yargs) => {
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

        let aliases = JSON.parse(fs.readFileSync(join(configFolder, "aliases.json"), "utf-8")) as Aliases

        let iToDisable = -1

        for (let i in aliases) {
            const alias = aliases[i]

            if (alias.name == name) iToDisable = parseInt(i)
        }

        if (iToDisable == -1) return log.error("Alias could not be found. Aborting...")

        aliases[iToDisable].enabled = false

        fs.writeFileSync(join(configFolder, "aliases.json"), JSON.stringify(aliases))

        return log.success("Disabled alias!")
    })
}