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
        if (process.env.PSModulePath) {
            return "powershell"
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
    }
    
    // Fallback: try to detect from parent process
    try {
        const { stdout } = await exec("ps -p $$ -o comm=")
        const shell = stdout.trim()
        if (shell.includes("bash")) return "bash"
        if (shell.includes("zsh")) return "zsh"
        if (shell.includes("fish")) return "fish"
    } catch {
        // If detection fails, return unknown
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
        default:
            throw new Error(`Unsupported shell: ${shell}`)
    }
}