import { describe, it, expect } from "bun:test";
import { cosineSimilarity } from "./math.js";

describe("cosineSimilarity", () => {
    it("should return 1 for identical vectors", () => {
        const vec = [1, 2, 3];
        expect(cosineSimilarity(vec, vec)).toBeCloseTo(1, 5);
    });

    it("should return -1 for opposite vectors", () => {
        const vecA = [1, 0, 0];
        const vecB = [-1, 0, 0];
        expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(-1, 5);
    });

    it("should return 0 for orthogonal vectors", () => {
        const vecA = [1, 0];
        const vecB = [0, 1];
        expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(0, 5);
    });

    it("should return 0 if one vector is zeroed", () => {
        const vecA = [0, 0, 0];
        const vecB = [1, 2, 3];
        expect(cosineSimilarity(vecA, vecB)).toBe(0);
    });

    it("should calculate similarity correctly for random vectors", () => {
        const vecA = [1, 2, 3];
        const vecB = [4, 5, 6];
        // dot = 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
        // magA = sqrt(1+4+9) = sqrt(14)
        // magB = sqrt(16+25+36) = sqrt(77)
        // similarity = 32 / (sqrt(14)*sqrt(77)) = 32 / sqrt(1078) ≈ 32 / 32.83 ≈ 0.97463
        expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(0.97463, 5);
    });

    it("should throw error for vectors of different lengths", () => {
        const vecA = [1, 2];
        const vecB = [1, 2, 3];
        expect(() => cosineSimilarity(vecA, vecB)).toThrow("Vectors must have the same length");
    });
});
