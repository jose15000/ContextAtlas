import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

let _pipe: FeatureExtractionPipeline | null = null;

async function getPipeline(): Promise<FeatureExtractionPipeline> {
    if (!_pipe) {
        _pipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    return _pipe;
}

export async function EmbedQuery(q: string | string[]): Promise<number[]> {
    const embed = await getPipeline();
    const embeddedQuery = await embed(q, { pooling: 'mean', normalize: true });
    return Array.from(embeddedQuery.data);
}