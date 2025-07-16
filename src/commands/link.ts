import { exec as execSync } from "node:child_process"
import { Yarg } from "../types/yarg"
import fs from "fs"
import { existsSync, mkdirSync } from "node:fs"
import { homedir, platform } from "node:os"
import { promisify } from "node:util"
import { join } from "node:path"
import { ensureConfigFolder } from "../util/config"
import { detectShell, findPowerShellExecutable, getRcFilePath } from "../util/shell"
import { Aliases } from "../types/aliases"
import { log } from "@clack/prompts"

const exec = promisify(execSync)

export const linkAliases = (yarg: Yarg) => {
    yarg.command("link", "Links/binds aliases to the shell. Must be run after adding/removing aliases in order to use them.", async (argv) => {
        const os = platform()

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

        const aliasesPreFiltering = JSON.parse(fs.readFileSync(aliasesFile, "utf-8")) as Aliases
        const aliases = aliasesPreFiltering.filter(alias => alias.enabled === true)

        log.step(`Loading ${aliases.length} aliases.`)

        if (os === "darwin" || os === "linux") {
            const home = homedir() || process.env.HOME || `/home/${process.env.USER || process.env.USERNAME || "user"}`
            
            let shell: string
            try {
                shell = await detectShell()
            } catch (error) {
                return log.error(`Failed to detect shell: ${error}`)
            }

            if (shell === "unknown") {
                return log.error("Unknown shell. Please add the following line to your shell's RC file manually:\n\n" + 
                                `source ${join(configFolder, "aliases.sh")}`)
            }

            let aliasFileContent = ""
            for (let { name, cmd } of aliases) {
                aliasFileContent += `alias ${name}="${cmd.replaceAll("\"", "\\\"")}"\n`
            }

            fs.writeFileSync(join(configFolder, "aliases.sh"), aliasFileContent)

            const rcInclude = `source ${join(configFolder, "aliases.sh")}`
            
            let rcPath: string
            try {
                rcPath = getRcFilePath(shell, home)
            } catch (error) {
                return log.error(`Unsupported shell: ${shell}. Add this manually to your shell's RC file:\n\n${rcInclude}`)
            }

            // Check if RC file exists, create if it doesn't
            if (!existsSync(rcPath)) {
                try {
                    // Create parent directories if needed
                    const parentDir = join(rcPath, "..")
                    if (!existsSync(parentDir)) {
                        mkdirSync(parentDir, { recursive: true })
                    }
                    fs.writeFileSync(rcPath, "")
                } catch (error) {
                    return log.error(`Failed to create RC file ${rcPath}: ${error}`)
                }
            }

            let rcContent = fs.readFileSync(rcPath, "utf-8")

            if (rcContent.includes(rcInclude)) {
                return log.success("Done! Restart your shell for the changes to take effect!")
            }

            rcContent += `\n\n${rcInclude}\n`
            fs.writeFileSync(rcPath, rcContent)

            return log.success("Done! Restart your shell for the changes to take effect!")
        }

        if (os === "win32") {
            const user = homedir() || process.env.USERPROFILE || process.env.HOME

            if (!user) {
                return log.error("Unable to determine user home directory")
            }

            let aliasFileContent = ""
            for (let { name, cmd } of aliases) {
                aliasFileContent += `function ${name} { ${cmd} }\n`
            }

            fs.writeFileSync(join(configFolder, "aliases.ps1"), aliasFileContent)

            // Find PowerShell executable
            let powershellCmd: string
            try {
                powershellCmd = await findPowerShellExecutable()
            } catch (error) {
                return log.error("PowerShell not found. Please install PowerShell to use this tool on Windows.")
            }

            // PowerShell profile is the same as .<shell>rc
            let profilePath: string
            try {
                const { stdout, stderr } = await exec(`${powershellCmd} -Command "$PROFILE"`)
                
                if (stderr) {
                    throw new Error(stderr)
                }
                
                profilePath = stdout.replace(/\r?\n/g, "").trim()
            } catch (error) {
                return log.error(`Failed to get PowerShell profile path: ${error}`)
            }

            // Create profile directory structure if it doesn't exist
            const profileDir = join(profilePath, "..")
            if (!existsSync(profileDir)) {
                try {
                    mkdirSync(profileDir, { recursive: true })
                } catch (error) {
                    return log.error(`Failed to create profile directory: ${error}`)
                }
            }

            const profileExists = existsSync(profilePath)
            let profile = ""

            if (profileExists) {
                profile = fs.readFileSync(profilePath, "utf-8")
            }

            const includeStatement = `. ${join(configFolder, "aliases.ps1")}`
            
            if (profile.includes(includeStatement)) {
                return log.success("Done! Restart your shell for the changes to take effect!")
            }

            profile += `\n\n${includeStatement}\n`
            fs.writeFileSync(profilePath, profile)

            return log.success("Done! Restart your shell for the changes to take effect!")
        }
        
        return log.error("Unsupported operating system")
    })
}