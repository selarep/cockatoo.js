import { CockatooOptions } from './cockatooOptions';

const deletionCost: number = 1;
const insertionCost: number = 1;
const substitutionCost: number = 1;
const transpositionCost: number = 1;

export function getCompleteness(search: string, pattern: string, score: number): number {
  let completeness = search.length / pattern.length * score;
  completeness > 100 ? completeness = 100 : null;
  return completeness;
}

export function orderMatches(matches: any[], options: CockatooOptions) {
  if (options.tokenize) {
    return matches.sort((a, b) => {
      let dif: number = Math.max(b.score, b.tokenScore) - Math.max(a.score, a.tokenScore);
      if (dif === 0) {
        dif = Math.min(b.score, b.tokenScore) - Math.min(a.score, a.tokenScore);
      }
      if (dif === 0) {
        if (a.item[options.keys[0]] > b.item[options.keys[0]]) {
          dif = 1;
        } else {
          dif = -1;
        }
      }
      return dif;
    });
  } else {
    return matches.sort((a, b) => {
      let dif: number = b.score - a.score;
      if (dif === 0) {
        if (a.item[options.keys[0]] > b.item[options.keys[0]]) {
          dif = 1;
        } else {
          dif = -1;
        }
      }
      return dif;
    });
  }
}

export function getScore(search: string, pattern: string, options: CockatooOptions): number {
  let score = 0;
  const minDistance = getMinDistance(search, pattern, options);
  if (search.length === 0 || minDistance < 0) {
    console.error('Error computing score of:', search, 'on pattern', pattern);
  } else {
    score = 100 - 100 * minDistance / search.length;
  }
  // console.log(pattern, score);
  return score;
}

export function getTokenScore(tokens: string[], patternTokens: string[], options: CockatooOptions): number {
  const tokensAgregatedLength = tokens.map(token => token.length).reduce((prev, curr) => prev + curr);
  let totalDistance = 0;
  let score = 0;
  for (let token of tokens) {
    let minTokenDistance: number;
    for (let patternToken of patternTokens) {
      const minDistance = getMinDistance(token, patternToken, options);
      if (token.length === 0 || minDistance < 0) {
        console.error('Error computing score of:', token, 'on pattern', patternTokens);
        return 0;
      } else {
        if (minTokenDistance === undefined || minDistance < minTokenDistance) {
          minTokenDistance = minDistance;
        }
      }
    }
    totalDistance += minTokenDistance;
  }
  score = 100 - 100 * totalDistance / tokensAgregatedLength;
  return score;
}

export function getMinDistance(search: string, pattern: string, options: CockatooOptions): number {
  let min: number = -1;
  if (!options.exhaustive) {
    if (search.length < pattern.length) {
      min = Math.min(
        damLevDistance(search, pattern.slice(0, search.length)), 
        damLevDistance(search, pattern)
      );
    } else  {
      min = damLevDistance(search, pattern);
    }
  } else {
    if (search.length < pattern.length) {
      for (let len = search.length; len <= pattern.length; len++) {
        for (let i = 0; i < pattern.length - len + 1; i++) {
          const s1 = search;
          const s2 = pattern.slice(i, i + len);
          let currentDistance = damLevDistance(s1, s2);
          if (min === -1 || currentDistance < min) {
            min = currentDistance;
          }
        }
      }
    } else if (search.length >= pattern.length) {
      let currentDistance = damLevDistance(search, pattern);
      if (min === -1 || currentDistance < min) {
        min = currentDistance;
      }
    }
  }
  

  return min;
}

export function damLevDistance(s1: string, s2: string): number {
  if (undefined == s1 || undefined == s2 || 'string' !== typeof s1
          || 'string' !== typeof s2 || s1.length === 0 || s2.length === 0) {
      return -1;
  }

  let d = initMatrix(s1, s2);
  if (null === d) {
    return -1;
  }

  for (var i = 1; i <= s1.length; i++) {
    let costSubst;
    let costTrans;
    for (let j = 1; j <= s2.length; j++) {
      if (s1.charAt(i - 1) === s2.charAt(j - 1)) {
          costSubst = 0;
          costTrans = 0;
      } else {
          costSubst = substitutionCost;
          costTrans = transpositionCost;
      }

      d[i][j] = Math.min(
        d[i - 1][j] + deletionCost, // deletion
        d[i][j - 1] + insertionCost, // insertion
        d[i - 1][j - 1] + costSubst, // substitution
      );

      if (i > 1 && j > 1 && s1[i - 1] === s2[j - 2] && s1[i - 2] === s2[j - 1]) {
        d[i][j] = Math.min(
          d[i][j],
          d[i - 2][j - 2] + costTrans,
        );
      }
    }
  }
  return d[s1.length][s2.length];
}

export function initMatrix(s1: string, s2: string): number[][] {
  let d: Array<Array<number>> = [];
  for (let i = 0; i <= s1.length; i++) {
    d[i] = [];
    d[i][0] = i;
  }
  for (let j = 0; j <= s2.length; j++) {
    d[0][j] = j;
  }
  return d;
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
  ;
}