// COE224: Assembly Language Studio - Educational Error Reporting Engine

import { AssemblyError } from './types';

export class ErrorEngine {
  static create(line: number, message: string, suggestion?: string, column?: number): AssemblyError {
    return { line, column, message, suggestion };
  }

  // Levenshtein distance for fuzzy-matching misspelled symbols/mnemonics
  static findClosestMatch(target: string, candidates: string[]): string | null {
    let bestCandidate: string | null = null;
    let minDistance = Infinity;

    const lowerTarget = target.toLowerCase();

    for (const candidate of candidates) {
      const lowerCandidate = candidate.toLowerCase();
      const dist = this.levenshtein(lowerTarget, lowerCandidate);
      if (dist < minDistance && dist <= 2) {
        minDistance = dist;
        bestCandidate = candidate;
      }
    }

    return bestCandidate;
  }

  private static levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}
