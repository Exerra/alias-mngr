import { exec as execSync } from "node:child_process"
import { Yarg } from "../types/yarg"
import fs from "fs"
import { existsSync, mkdirSync } from "node:fs"
import { mkdir } from "node:fs/promises"
import { homedir, platform } from "node:os"
import { promisify } from "node:util"
import { join } from "node:path"
import { getConfigFolder } from "../util/config"
import { Aliases } from "../types/aliases"
import { log } from "@clack/prompts"

const exec = promisify(execSync)

export const linkAliases = (yarg: Yarg) => {
    yarg.command("link", "Links/binds aliases to the shell. Must be run after adding/removing aliases in order to use them.", async (argv) => {
        const os = platform()

        const configFolder = getConfigFolder()

        if (!configFolder) return log.error("Invalid OS.")

        if (!existsSync(configFolder)) mkdirSync(configFolder)

        if (!existsSync(join(configFolder, "aliases.json"))) fs.writeFileSync(join(configFolder, "aliases.json"), JSON.stringify([]))

        const aliasesPreFiltering = JSON.parse(fs.readFileSync(join(configFolder, "aliases.json"), "utf-8")) as Aliases
        const aliases = aliasesPreFiltering.filter(alias => alias.enabled == true)

        log.step(`Loading ${aliases.length} aliases.`)

        if (os == "darwin" || os == "linux") {
            const home = homedir() || process.env.HOME || `/home/${process.env.USER}`
            const shell = process.env.SHELL as string

            let aliasFileContent = ""

            for (let { name, cmd } of aliases) {
                aliasFileContent += `alias ${name}="${cmd.replaceAll("\"", "\\\"")}"\n`
            }

            fs.writeFileSync(join(configFolder, "aliases.sh"), aliasFileContent)

            let rcInclude = "source " + join(configFolder, "aliases.sh")

            let rc = ""
            let supported = true

            if (shell.includes("bash")) rc = ".bashrc"
            else if (shell.includes("zsh")) rc = ".zshrc"
            else supported = false

            if (!supported) return log.error("Shell not supported yet. Add this manually to your ~/.<shell>rc file:\n\n" + rcInclude)

            let rcContent = fs.readFileSync(join(home, rc), "utf-8")

            if (rcContent.includes(rcInclude)) return log.success("Done! Restart your shell for the changes to take effect!")

            rcContent += "\n\n" + rcInclude + "\n"

            fs.writeFileSync(join(home, rc), rcContent)

            return log.success("Done! Restart your shell for the changes to take effect!")
        }

        if (os == "win32") {
            const user = homedir() || process.env["USERPROFILE"]

            let aliasFileContent = ""

            for (let { name, cmd } of aliases) {
                aliasFileContent += `function ${name} { ${cmd} }\n`
            }

            fs.writeFileSync(join(configFolder, "aliases.ps1"), aliasFileContent)

            // PowerShell profile is the same as .<shell>rc
            // If anything is set to execute and print in the profile, this cannot grab the path. Need to fix.
            let { stdout: profilePath, stderr } = await exec(`powershell.exe -Command "$PROFILE"`)

            profilePath = profilePath.replace("\r", "").replace("\n", "")

            let profilePathCheck = profilePath.replace(user!, "")
            let profilePathArr = profilePathCheck.split("\\")

            let previousPath = user

            for (let dir of profilePathArr) {
                if (dir == "") continue
                if (dir.replace("\r", "").replace("\n", "").endsWith(".ps1")) continue

                if (!existsSync(join(previousPath!, dir))) mkdirSync(join(previousPath!, dir))

                previousPath = join(previousPath!, dir)
            }

            const profileExists = existsSync(profilePath)
            let profile = ""

            if (profileExists) profile = fs.readFileSync(profilePath, "utf-8")

            profile += `\n\n. ${join(configFolder, "aliases.ps1")}\n`

            fs.writeFileSync(profilePath, profile)

            return log.success("Done! Restart your shell for the changes to take effect!")
        }
    })
}