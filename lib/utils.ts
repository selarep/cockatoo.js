import { CockatooOptions } from './cockatooOptions';
import { Match } from './match';

export function getCompleteness(search: string, pattern: string, score: number): number {
  let completeness = search.length / pattern.length;
  completeness > 1 ? completeness = 1 : null;
  return completeness * score;
}

export function applySensitiveness(text: string, options: CockatooOptions) {
  let result: string = text;
  if (!options.accentSensitive) {
    result = removeAccents(result);
  }
  if (!options.caseSensitive) {
    result = result.toLowerCase();
  }
  return result;
}

export function removeAccents(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function orderMatches<T>(matches: Match<T>[]) {
  return matches.sort((a, b) => {
    let dif: number = getMaxScoreDif(a, b);
    if (dif === 0) {
      dif = getMinScoreDif(a, b);
    }
    if (dif === 0) {
      dif = getCompletenessDif(a, b);
    }
    if (dif === 0) {
      dif = getTokenMatchesDif(a, b);
    }
    return dif;
  });
}

export function getMaxScoreDif(a: Match<any>, b: Match<any>) {
  return Math.max(b.score, b.tokenScore || 0) - Math.max(a.score, a.tokenScore || 0);
}

export function getMinScoreDif(a: Match<any>, b: Match<any>) {
  return Math.min(b.score, b.tokenScore || 100) - Math.min(a.score, a.tokenScore || 100);
}

export function getCompletenessDif(a: Match<any>, b: Match<any>) {
  return b.completeness - a.completeness;
}

export function getTokenMatchesDif(a: Match<any>, b: Match<any>) {
  return (b.tokenMatches && b.tokenMatches.length || 1) - (a.tokenMatches && a.tokenMatches.length || 1);
}