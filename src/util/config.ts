import { homedir, platform } from "node:os"
import { join } from "node:path"
import { existsSync, mkdirSync } from "node:fs"

export const getConfigFolder = (): string | null => {
    const os = platform()

    if (os === "darwin" || os === "linux") {
        const home = homedir() || process.env.HOME || `/home/${process.env.USER || process.env.USERNAME || "user"}`
        const configFolder = ".alias-manager-exerra"

        return join(home, configFolder)
    }

    if (os === "win32") {
        // Try multiple Windows environment variables for robustness
        const local = process.env.LOCALAPPDATA || 
                     process.env.APPDATA || 
                     join(process.env.USERPROFILE || process.env.HOME || "C:\\Users\\Default", "AppData\\Local")

        return join(local, "alias-manager-exerra")
    }

    // For other platforms, try to use home directory
    const home = homedir()
    if (home) {
        return join(home, ".alias-manager-exerra")
    }

    return null
}

/**
 * Ensures the config folder exists, creating it if necessary
 * @returns string The config folder path
 */
export const ensureConfigFolder = (): string => {
    const configFolder = getConfigFolder()
    
    if (!configFolder) {
        throw new Error("Unable to determine config folder for current platform")
    }
    
    if (!existsSync(configFolder)) {
        try {
            mkdirSync(configFolder, { recursive: true })
        } catch (error) {
            throw new Error(`Failed to create config folder: ${error}`)
        }
    }
    
    return configFolder
}