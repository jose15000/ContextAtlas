import fs from "fs";
import path from "path";

export function getFile(filePath: string) {
    try {
        const absolutePath = path.resolve(process.cwd(), filePath);
        return fs.readFileSync(absolutePath, "utf-8");
    } catch (error) {
        throw new Error(`Error reading file: ${String(error)}`);
    }
}
