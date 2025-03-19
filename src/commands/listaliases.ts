import { join } from "node:path"
import { Yarg } from "../types/yarg"
import { getConfigFolder } from "../util/config"
import fs from "node:fs"
import { existsSync, mkdirSync } from "node:fs"
import { Aliases } from "../types/aliases"
import Table from "cli-table"
import { log } from "@clack/prompts"

export const listAliasesCMD = (yarg) => {
    yarg.command("list", "List all aliases", (yargs) => {
        return yargs
    }, (argv) => {
        const configFolder = getConfigFolder()
        
        if (!configFolder) return log.error("Invalid OS.")

        if (!existsSync(configFolder)) mkdirSync(configFolder)

        if (!existsSync(join(configFolder, "aliases.json"))) fs.writeFileSync(join(configFolder, "aliases.json"), JSON.stringify([]))

        const aliases = JSON.parse(fs.readFileSync(join(configFolder, "aliases.json"), "utf-8")) as Aliases

        const table = new Table({
            head: ["Name", "Command", "Enabled?"]
        })

        for (let alias of aliases) {
            table.push([alias.name, alias.cmd, (alias.enabled ? "Yes" : "No")])
        }

        return log.success(table.toString())
    })
}