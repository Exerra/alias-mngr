import { homedir, platform } from "node:os"
import { join } from "node:path"

export const getConfigFolder = () => {
    const os = platform()

    if (os == "darwin" || os == "linux") {
        const home = homedir() || process.env.HOME || `/home/${process.env.USER}`
        const configFolder = "/.alias-manager-exerra"

        return join(home, configFolder)
    }

    if (os == "win32") {
        const local = process.env["LOCALAPPDATA"] as string

        return join(local, "alias-manager-exerra")
    }

    else return null
}