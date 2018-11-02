import { CockatooOptions } from "./cockatooOptions";
import { orderMatches, applySensitiveness, getCompleteness } from "./utils";
import { DamerauLevenshtein } from "./damerauLevenshtein";
import { performance } from "perf_hooks";
import { Match } from "./match";
import { TokenMatch } from "./tokenMatch";

export class Cockatoo<T> {
  damLev: DamerauLevenshtein = new DamerauLevenshtein();

  elementsList: T[];
  options: CockatooOptions;

  searchableValuesList: string[][]; // For each element, there is an array of values of all keys. Example: In options 2 keys: "author" and "title". For each element: ["Cervantes", "El Quijote"].
  searchableTokensList: string[][]; // Same as above, but separed by token, and tokens corresponding to all keys are mixed.
  originalValuesList: string[][];
  originalTokensList: string[][];
  
  cache: {
    [key: string]: {
      results: Match<T>[],
      date: Date,
    },
  } = {};

  maxCacheElements: number;

  /**
   * Create a Cockatoo.js instance
   */
  constructor(elementsList: T[], options: CockatooOptions, maxCacheElements = 100) {
    this.elementsList = elementsList;
    this.options = options;
    this.maxCacheElements = maxCacheElements;
    this.originalValuesList = this.generateValuesList(elementsList, this.options);
    if (this.options.tokenize) {
      this.originalTokensList = this.generateTokensList(this.originalValuesList);
    }
    this.searchableValuesList = this.originalValuesList
    .map(values => {
      return values.map(value => applySensitiveness(value, this.options));
    });
    if (this.options.tokenize) {
      this.searchableTokensList = this.generateTokensList(this.searchableValuesList);
    }
  }

  async search(searchText: string, filter?: (element: T) => boolean): Promise<Match<T>[]> {
    // If search text is empty, return []
    if (searchText.length === 0) {
      return [];
    }

    // If there is result in cache, update date and return it
    if (this.cache[searchText]) {
      this.cache[searchText].date = new Date();
      if (filter !== undefined) {
        return this.cache[searchText].results.filter(match => {
          return filter(match.item);
        });
      } else {
        return this.cache[searchText].results;
      }      
    }

    const originalSearchText = searchText;
    searchText = applySensitiveness(searchText, this.options);
    const searchTextTokens = this.getTokensFromText(searchText);
    const originalSearchTextTokens = this.getTokensFromText(originalSearchText);
    let matches: Match<T>[] = [];
    const promises: Promise<void>[] = [];
    let searchableIndexes: number[];
    if (filter !== undefined) {
      searchableIndexes = this.elementsList
      .map((value, index) => {
        return {index, value};
      })
      .filter(({value}) => {
        return filter(value);
      })
      .map(({index}) => {
        return index;
      });
    } else {
      searchableIndexes = this.elementsList
      .map((value, index) => {
        return index;
      });
    }
    for (let i = 0; i < searchableIndexes.length; i++) {
      promises.push(
        this.getMatch(searchText, searchTextTokens, originalSearchTextTokens, searchableIndexes[i])
        .then(match => {
          if (match !== undefined) {
            matches.push(match);
          }
        }));
    }
    await Promise.all(promises);

    if (this.options.sorted) {
      matches = orderMatches(matches);
    }
    // If cache overflow, delete oldest entry
    if (Object.keys(this.cache).length > (this.maxCacheElements - 1)) {
      const cacheKeysOrdered = Object.keys(this.cache).sort((a, b) => {
        return this.cache[a].date.getDate() - this.cache[b].date.getDate();
      });
      delete this.cache[cacheKeysOrdered[0]];
    }
    // Before returning new result, save it in cache
    this.cache[originalSearchText] = {
      date: new Date(),
      results: matches,
    }
    return matches;
  }

  getScore(search: string, patterns: string[], options: CockatooOptions) {
    let score: number;
    let minDistance: number;
    let patternMatch: string;
    for (let i = 0; i < patterns.length; i++) {
      const distance = this.getMinDistance(search, patterns[i], options);
      if (search.length === 0 || minDistance < 0) {
        console.error('Error computing score of:', search, 'on pattern', patterns[i]);
        return {score: 0, patternMatch: ''};
      } else {
        if (minDistance === undefined || distance < minDistance) {
          minDistance = distance;
          patternMatch = patterns[i];
        }
      }
    }
    score = 100 - 100 * minDistance / search.length;
    return {score, patternMatch};
  }

  getTokenScore(tokens: string[], patternTokens: string[], originalTokens: string[], originalPatternTokens: string[]) {
    const tokensAgregatedLength = tokens
      .map(token => token.length)
      .reduce((prev, curr) => prev + curr);
    let totalDistance = 0;
    let tokenScore = 0;
    let tokenMatches: TokenMatch[] = [];
    for (let i = 0; i < tokens.length; i++) {
      let minTokenDistance: number;
      let patternTokenMatch: string;
      for (let j = 0; j < patternTokens.length; j++) {
        const minDistance = this.getMinDistance(tokens[i], patternTokens[j], this.options);
        if (tokens[i].length === 0 || minDistance < 0) {
          console.error('Error computing score of:', originalTokens[i], 'on pattern', originalPatternTokens[j]);
          return {tokenScore, tokenMatches: []};
        } else {
          if (minTokenDistance === undefined || minDistance < minTokenDistance) {
            minTokenDistance = minDistance;
            patternTokenMatch = originalPatternTokens[j];
          }
        }
      }
  
      totalDistance += minTokenDistance;
      tokenScore = 100 - minTokenDistance / tokens[i].length * 100;
      tokenMatches.push(new TokenMatch(
        {
          searchToken: originalTokens[i],
          patternToken: patternTokenMatch,
          score: tokenScore,
          completeness: getCompleteness(tokens[i], patternTokenMatch, tokenScore)
        }
      ));
    }
  
    tokenScore = 100 - 100 * totalDistance / tokensAgregatedLength;
    return {tokenScore, tokenMatches};
  }

  getMinDistance(search: string, pattern: string, options: CockatooOptions): number {
    let min: number = -1;
    if (!options.exhaustive) {
      if (search.length < pattern.length) {
        min = Math.min(
          this.damLev.getDistance(search, pattern.slice(0, search.length)), 
          this.damLev.getDistance(search, pattern)
        );
      } else  {
        min = this.damLev.getDistance(search, pattern);
      }
    } else {
      if (search.length < pattern.length) {
        for (let len = search.length; len <= pattern.length; len++) {
          for (let i = 0; i < pattern.length - len + 1; i++) {
            const s1 = search;
            const s2 = pattern.slice(i, i + len);
            let currentDistance = this.damLev.getDistance(s1, s2);
            if (min === -1 || currentDistance < min) {
              min = currentDistance;
            }
          }
        }
      } else if (search.length >= pattern.length) {
        let currentDistance = this.damLev.getDistance(search, pattern);
        if (min === -1 || currentDistance < min) {
          min = currentDistance;
        }
      }
    }
    return min;
  }

  private async getMatch(searchText: string, searchTextTokens: string[], originalSearchTextTokens: string[], index: number) {
    let score: number;
    let patternMatch: string;
    let completeness: number;
    let match: Match<T>;
    // If tokenize is not active or search or pattern are multi-tokened, we get score and completeness.
    if (!this.options.tokenize || (searchTextTokens.length > 1 || this.searchableTokensList[index].length > 1)) {
      const scoreResult = this.getScore(searchText, this.searchableValuesList[index], this.options);
      score = scoreResult.score;
      patternMatch = scoreResult.patternMatch;
      completeness = getCompleteness(searchText, patternMatch, score);
    }
    // If tokenize is active, we get tokenScore. If also, search and pattern are single-tokened, we assign score and completeness from token.
    if (this.options.tokenize) {
      let {tokenScore, tokenMatches} = this.getTokenScore(searchTextTokens, this.searchableTokensList[index], originalSearchTextTokens, this.originalTokensList[index]);
      
      if (score === undefined) {
        score = tokenScore;
        completeness = tokenMatches[0].completeness;
      }
      // If score or tokenScore are above its threshold, we create the match object.
      if (score >= this.options.threshold || tokenScore >= (this.options.tokenThreshold || this.options.threshold)) {
        match = new Match<T>({
          item: this.elementsList[index],
          score,
          completeness,
          tokenScore,
          tokenMatches,
        });
      }
    } else if (score >= this.options.threshold) {
      // If not tokenized, and score is above its threshold, we create the match object.
      match = new Match<T>({
        item: this.elementsList[index],
        score,
        completeness
      });
    }
    return match;
  }


  private generateValuesList(elementsList: T[] | string[], options: CockatooOptions) {
    const valuesList: string[][] = [];
    if (typeof elementsList[0] === 'string') {
      for (let i = 0; i < elementsList.length; i++) {
        valuesList[i] = [elementsList[i] as string];
      }
    } else {
      for (let i = 0; i < elementsList.length; i++) {
        valuesList[i] = [];
        for (let j = 0; j < options.keys.length; j++) {
          valuesList[i][j] = elementsList[i][options.keys[j]];
        }
      }
    }
    return valuesList;
  }

  private generateTokensList(valuesList: string[][]) {
    const tokensList: string[][] = [];
    for (let i = 0; i < valuesList.length; i++) {
      const currentElementTokens: string[] = [];
      for (let j = 0; j < valuesList[i].length; j++) {
        currentElementTokens.push(
          ...this.getTokensFromText(valuesList[i][j])
        );
      }
      tokensList[i] = currentElementTokens;
    }
    return tokensList;
  }

  private getTokensFromText(text: string) {
    return text
    .split(' ')
    .filter(token => token !== '');
  }
}