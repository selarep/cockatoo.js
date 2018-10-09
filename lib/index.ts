import { CockatooOptions } from "./cockatooOptions";
import { orderMatches, getScore, getTokenScore, applySensitiveness, getCompleteness } from "./utils";
import * as Bluebird from 'bluebird';

export class Cockatoo {

  /**
   * Create a Cockatoo.js instance
   */
  constructor() {}

  async search(searchText: string, elements: any[], options: CockatooOptions): Promise<any[]> {
    options = new CockatooOptions(options);
    if (searchText.length === 0) {
      return [];
    }
    searchText = applySensitiveness(searchText, options);
    let matches: any[] = [];
    await Bluebird.map(elements, (element) => {
      for (let key of options.keys) {
        const score = getScore(searchText, applySensitiveness(element[key], options), options);
        const completeness = getCompleteness(searchText, element[key], score);

        if (options.tokenize) {
          let tokenScore: number;
          let tokens = searchText.split(' ');
          tokens = tokens.filter(token => token !== '');
          let patternTokens = applySensitiveness(element[key], options).split(' ');
          patternTokens = patternTokens.filter(token => token !== '');
          if (tokens.length > 1 || patternTokens.length > 1) {
            tokenScore = getTokenScore(tokens, patternTokens, options);
            if (score >= options.threshold || tokenScore >= (options.tokenThreshold || options.threshold) && !matches.find(match => match === element)) {
              matches.push({item: element, score, tokenScore});
            }
          } else {
            tokenScore = score;
            const currentMatch = matches.find(match => match === element);
            if (score >= options.threshold && !currentMatch) {
              matches.push({item: element, score, tokenScore});
            } else if (currentMatch) {
              if (currentMatch.score < score) {
                currentMatch.score = score
              } else if (currentMatch.tokenScore < tokenScore) {
                currentMatch.tokenScore = tokenScore;
              }
            }
          }
        } else {
          if (score >= options.threshold && !matches.find(match => match === element)) {
            matches.push({item: element, score, completeness});
          }
        }
      }
    }, {concurrency: 4});

    
    // for (let element of elements) {
    //   for (let key of options.keys) {
    //     const score = getScore(searchText, applySensitiveness(element[key], options), options);
  
    //     if (options.tokenize) {
    //       let tokenScore: number;
    //       let tokens = searchText.split(' ');
    //       tokens = tokens.filter(token => token !== '');
    //       if (tokens.length > 1) {
    //         tokenScore = getTokenScore(tokens, applySensitiveness(element[key], options), options);
    //         if (score >= options.threshold || tokenScore >= (options.tokenThreshold || options.threshold) && !matches.find(match => match === element)) {
    //           matches.push({item: element, score, tokenScore});
    //         }
    //       } else {
    //         tokenScore = score;
    //         const currentMatch = matches.find(match => match === element);
    //         if (score >= options.threshold && !currentMatch) {
    //           matches.push({item: element, score, tokenScore});
    //         } else if (currentMatch) {
    //           if (currentMatch.score < score) {
    //             currentMatch.score = score
    //           } else if (currentMatch.tokenScore < tokenScore) {
    //             currentMatch.tokenScore = tokenScore;
    //           }
    //         }
    //       }
    //     } else {
    //       if (score >= options.threshold && !matches.find(match => match === element)) {
    //         matches.push({item: element, score});
    //       }
    //     }
    //   }
    // }
    if (options.sorted) {
      matches = orderMatches(matches, options);
    }
    return matches;
  }
}