import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTargetDir(): string | null {
    const candidates = [process.env.INIT_CWD, process.env.PWD, process.cwd()];

    for (const dir of candidates) {
        if (!dir) continue;
        let current = path.resolve(dir);
        while (current !== path.parse(current).root) {
            if (fs.existsSync(path.join(current, "package.json"))) {
                // Se não for o próprio pacote @contextatlas/core em node_modules
                if (!current.includes("node_modules")) {
                    return current;
                }
            }
            current = path.dirname(current);
        }
    }

    return null;
}

function run(): void {
    const targetDirStr = getTargetDir();
    if (!targetDirStr) {
        return;
    }

    const currentDir = process.cwd();
    // Apenas ignora se estivermos compilando/instalando no próprio repositório original do ContextAtlas
    if (path.basename(currentDir) === "ContextAtlas" && path.resolve(targetDirStr) === path.resolve(currentDir)) {
        return;
    }

    const templateDir = path.resolve(__dirname, "..", "agents-template");
    const targetAgentsDir = path.resolve(targetDirStr, ".agents");

    if (!fs.existsSync(templateDir)) {
        return;
    }

    if (!fs.existsSync(targetAgentsDir)) {
        fs.mkdirSync(targetAgentsDir, { recursive: true });
    }

    function copyRecursive(src: string, dest: string): void {
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);
            if (entry.isDirectory()) {
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath, { recursive: true });
                }
                copyRecursive(srcPath, destPath);
            } else {
                if (!fs.existsSync(destPath)) {
                    fs.copyFileSync(srcPath, destPath);
                    console.log(`[ContextAtlas] Workflow agent model instalado: ${entry.name}`);
                }
            }
        }
    }

    copyRecursive(templateDir, targetAgentsDir);

    // Garantir criação inicial do diretório /context no projeto do consumidor
    const targetContextDir = path.resolve(targetDirStr, "context");
    if (!fs.existsSync(targetContextDir)) {
        fs.mkdirSync(targetContextDir, { recursive: true });
        console.log("[ContextAtlas] Diretório /context criado com sucesso.");
    }

    const initialConfigPath = path.resolve(targetContextDir, "codeatlas-config.json");
    if (!fs.existsSync(initialConfigPath)) {
        const defaultConfig = {
            version: "1.1.0",
            createdAt: new Date().toISOString(),
            autoIndex: true
        };
        fs.writeFileSync(initialConfigPath, JSON.stringify(defaultConfig, null, 2), "utf-8");
        console.log("[ContextAtlas] Arquivo context/codeatlas-config.json inicializado.");
    }

    const clientHelperPath = path.resolve(targetContextDir, "contextatlas.client.ts");
    if (!fs.existsSync(clientHelperPath)) {
        const clientContent = `import { ContextAtlasClient } from "@contextatlas/core";

export const contextAtlas = new ContextAtlasClient();
`;
        fs.writeFileSync(clientHelperPath, clientContent, "utf-8");
        console.log("[ContextAtlas] Helper context/contextatlas.client.ts criado com sucesso.");
    }
}

run();
