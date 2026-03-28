import { cosineSimilarity } from "../utils/math.js";
import { EmbedQuery } from "./embedQuery.js";
import { semanticData } from "../types/semanticData.js";
import { SemanticSearchResult } from "./semanticSearchResult.js";

export async function semanticSearch(input: semanticData): Promise<SemanticSearchResult[]> {
    const embedQuery = await EmbedQuery(input.query);

    const results: SemanticSearchResult[] = [];

    for (const node of input.graph.nodes.values()) {
        const embedding = node.data.embedding;
        if (!embedding || embedding.length === 0) continue;

        const score = cosineSimilarity(embedQuery, embedding);

        if (score >= input.threshold) {
            results.push({
                id: node.id,
                type: node.type,
                data: node.data,
                score: score
            });
        }
    }
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, input.limit);
}