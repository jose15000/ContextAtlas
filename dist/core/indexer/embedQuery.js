import { pipeline } from "@huggingface/transformers";
let _pipe = null;
async function getPipeline() {
    if (!_pipe) {
        _pipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    return _pipe;
}
export async function EmbedQuery(q) {
    const embed = await getPipeline();
    const embeddedQuery = await embed(q, { pooling: 'mean', normalize: true });
    return Array.from(embeddedQuery.data);
}
