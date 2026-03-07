import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
async function main() {
    console.log("Iniciando MCP Client de Teste...");
    // 1. Configurar o Transport para rodar nosso próprio servidor compilado
    // Usamos path.resolve para garantir o caminho absoluto correto independente de onde rodarmos
    const serverPath = path.resolve(process.cwd(), "dist/src/MCP/server.js");
    const transport = new StdioClientTransport({
        command: "node",
        args: [serverPath] // Roda o servidor isoladamente
    });
    // 2. Criar o Cliente
    const client = new Client({
        name: "test-client",
        version: "1.0.0",
    }, {
        capabilities: {},
    });
    console.log(`Conectando ao servidor em: ${serverPath}`);
    await client.connect(transport);
    console.log("✅ Conectado com sucesso!\n");
    // ==========================================
    // 3. Testar as Ferramentas
    // ==========================================
    try {
        // A. Listar tools
        console.log("--- Listando Ferramentas ---");
        const { tools } = await client.listTools();
        console.log("Tools disponíveis:", tools.map(t => t.name).join(", "));
        console.log("----------------------------\n");
        // B. Testar a busca de símbolo (search_symbol)
        console.log("--- Testando 'search_symbol' ---");
        console.log("Buscando por: 'buildContextGraph'");
        const searchResult = await client.callTool({
            name: "search_symbol",
            arguments: {
                query: "buildContextGraph"
            }
        });
        // As ferramentas retornam um array 'content' com os resultados
        if (Array.isArray(searchResult.content) && searchResult.content.length > 0) {
            console.log("Resultado:\n", searchResult.content[0].text);
        }
        else {
            console.log("Nenhum conteúdo retornado.");
        }
        console.log("----------------------------\n");
        // C. Testar leitura de arquivo (get_file)
        console.log("--- Testando 'get_file' ---");
        console.log("Lendo arquivo: package.json");
        const fileResult = await client.callTool({
            name: "get_file",
            arguments: {
                path: "./package.json"
            }
        });
        if (Array.isArray(fileResult.content) && fileResult.content.length > 0) {
            const fileContent = fileResult.content[0].text || "";
            console.log("Resultado (primeiros 150 caracteres):\n", fileContent.substring(0, 150) + "...");
        }
        console.log("\n----------------------------");
    }
    catch (error) {
        console.error("Erro ao testar ferramentas:", error);
    }
    finally {
        // 4. Fechar conexão
        console.log("\nEncerrando o cliente...");
        await client.close();
        process.exit(0);
    }
}
main().catch(console.error);
