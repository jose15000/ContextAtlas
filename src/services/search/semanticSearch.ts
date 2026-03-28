import { cosineSimilarity } from "../../utils/math.js";
import { EmbedQuery } from "../../core/indexer/embedQuery.js";
import { SemanticSearchRequestDTO, SearchResultDTO } from "../../core/dtos/search.dto.js";

export async function semanticSearch(input: SemanticSearchRequestDTO): Promise<SearchResultDTO[]> {
    const embedQuery = await EmbedQuery(input.query);

    const results: SearchResultDTO[] = [];

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