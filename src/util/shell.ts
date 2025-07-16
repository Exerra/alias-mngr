import { platform } from "node:os"
import { exec as execSync } from "node:child_process"
import { promisify } from "node:util"

const exec = promisify(execSync)

/**
 * Detects the current shell and returns its name
 * @returns Promise<string> The shell name (bash, zsh, powershell, etc.)
 */
export const detectShell = async (): Promise<string> => {
    const os = platform()
    
    if (os === "win32") {
        // On Windows, check if we're running in PowerShell
        if (process.env.PSModulePath || process.env.POWERSHELL_TELEMETRY_OPTOUT !== undefined) {
            return "powershell"
        }
        // Check if we're running in Windows Terminal or Command Prompt
        if (process.env.WT_SESSION) {
            return "powershell" // Windows Terminal usually uses PowerShell
        }
        // Default to PowerShell on Windows
        return "powershell"
    }
    
    // On Unix-like systems, check SHELL environment variable
    if (process.env.SHELL) {
        const shell = process.env.SHELL
        if (shell.includes("bash")) return "bash"
        if (shell.includes("zsh")) return "zsh"
        if (shell.includes("fish")) return "fish"
        if (shell.includes("csh")) return "csh"
        if (shell.includes("tcsh")) return "tcsh"
        if (shell.includes("ksh")) return "ksh"
    }
    
    // Fallback: try to detect from parent process
    try {
        const { stdout } = await exec("ps -p $$ -o comm= 2>/dev/null || echo unknown")
        const shell = stdout.trim()
        if (shell.includes("bash")) return "bash"
        if (shell.includes("zsh")) return "zsh"
        if (shell.includes("fish")) return "fish"
        if (shell.includes("csh")) return "csh"
        if (shell.includes("tcsh")) return "tcsh"
        if (shell.includes("ksh")) return "ksh"
    } catch {
        // If detection fails, continue to return unknown
    }
    
    return "unknown"
}

/**
 * Finds the appropriate PowerShell executable
 * @returns Promise<string> The PowerShell executable path
 */
export const findPowerShellExecutable = async (): Promise<string> => {
    const possibleCommands = ["pwsh", "powershell", "powershell.exe", "pwsh.exe"]
    
    for (const cmd of possibleCommands) {
        try {
            await exec(`${cmd} -Command "echo test"`)
            return cmd
        } catch {
            continue
        }
    }
    
    throw new Error("No PowerShell executable found")
}

/**
 * Gets the RC file path for the current shell
 * @param shell The shell name
 * @param homedir The home directory
 * @returns string The RC file path
 */
export const getRcFilePath = (shell: string, homedir: string): string => {
    switch (shell) {
        case "bash":
            return `${homedir}/.bashrc`
        case "zsh":
            return `${homedir}/.zshrc`
        case "fish":
            return `${homedir}/.config/fish/config.fish`
        case "csh":
            return `${homedir}/.cshrc`
        case "tcsh":
            return `${homedir}/.tcshrc`
        case "ksh":
            return `${homedir}/.kshrc`
        default:
            throw new Error(`Unsupported shell: ${shell}`)
    }
}

/**
 * Ensures the parent directory of a file exists
 * @param filePath The file path
 */
export const ensureParentDir = (filePath: string): void => {
    const { dirname } = require("node:path")
    const { existsSync, mkdirSync } = require("node:fs")
    
    const parentDir = dirname(filePath)
    if (!existsSync(parentDir)) {
        mkdirSync(parentDir, { recursive: true })
    }
}