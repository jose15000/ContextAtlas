import { pipeline } from "@xenova/transformers";
export async function EmbedQuery(q) {
    const embed = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    const embeddedQuery = await embed(q, { pooling: 'mean', normalize: true });
    return Array.from(embeddedQuery.data);
}
