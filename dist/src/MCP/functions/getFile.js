import fs from "fs";
import path from "path";
export function getFile(filePath) {
    try {
        const absolutePath = path.resolve(process.cwd(), filePath);
        const content = fs.readFileSync(absolutePath, "utf-8");
        return { content: [{ type: "text", text: content }] };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Error reading file: ${String(error)}` }],
            isError: true
        };
    }
}
