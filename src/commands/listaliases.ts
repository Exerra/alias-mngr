import { join } from "node:path"
import { Yarg } from "../types/yarg"
import { ensureConfigFolder } from "../util/config"
import fs from "node:fs"
import { existsSync } from "node:fs"
import { Aliases } from "../types/aliases"
import Table from "cli-table"
import { log } from "@clack/prompts"

export const listAliasesCMD = (yarg: Yarg) => {
    yarg.command("list", "List all aliases", (yargs) => {
        return yargs
    }, (argv) => {
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

        if (aliases.length === 0) {
            return log.info("No aliases found. Use 'alias-mngr add' to create one.")
        }

        const table = new Table({
            head: ["Name", "Command", "Enabled?"]
        })

        for (let alias of aliases) {
            table.push([alias.name, alias.cmd, (alias.enabled ? "Yes" : "No")])
        }

        return log.success(table.toString())
    })
}