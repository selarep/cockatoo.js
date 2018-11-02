'use strict';

import { 
  getCompleteness,
  removeAccents,
  applySensitiveness,
  orderMatches,
  getMaxScoreDif,
  getMinScoreDif,
  getCompletenessDif,
  getTokenMatchesDif
} from '../lib/utils';
import { Match, CockatooOptions } from '../lib';

describe('Utils Module', () => {
  it('getMaxScoreDif', () => {
    let dif = getMaxScoreDif({score: 80, tokenScore: 100} as Match<any>, {score: 90} as Match<any>);
    expect(dif).toBe(-10);
    dif = getMaxScoreDif({score: 90} as Match<any>, {score: 80, tokenScore: 100} as Match<any>);
    expect(dif).toBe(10);
    dif = getMaxScoreDif({tokenScore: 10, score: 90} as Match<any>, {tokenScore: 80, score: 100} as Match<any>);
    expect(dif).toBe(10);
  });

  it('getMinScoreDif', () => {
    let dif = getMinScoreDif({score: 80, tokenScore: 100} as Match<any>, {score: 90} as Match<any>);
    expect(dif).toBe(10);
    dif = getMinScoreDif({score: 90} as Match<any>, {score: 80, tokenScore: 100} as Match<any>);
    expect(dif).toBe(-10);
    dif = getMinScoreDif({tokenScore: 10, score: 90} as Match<any>, {tokenScore: 80, score: 100} as Match<any>);
    expect(dif).toBe(70);
  });

  it('getCompletenessDif', () => {
    let dif = getCompletenessDif({completeness: 100} as Match<any>, {completeness: 33} as Match<any>);
    expect(dif).toBe(-67);
    dif = getCompletenessDif({completeness: 33} as Match<any>, {completeness: 100} as Match<any>);
    expect(dif).toBe(67);
  });

  it('getTokenMatchesDif', () => {
    let dif = getTokenMatchesDif({tokenMatches: [{}, {}]} as Match<any>, {tokenMatches: [{}, {}]} as Match<any>);
    expect(dif).toBe(0);
    dif = getTokenMatchesDif({tokenMatches: [{}]} as Match<any>, {tokenMatches: [{}, {}]} as Match<any>);
    expect(dif).toBe(1);
    dif = getTokenMatchesDif({tokenMatches: [{}, {}]} as Match<any>, {tokenMatches: [{}]} as Match<any>);
    expect(dif).toBe(-1);
  });

  describe('should order matches properly', async () => {
    it('By score', () => {
      const matches: Match<undefined>[] = [
        {score: 50, tokenScore: 60} as Match<undefined>,
        {score: 100, tokenScore: 20} as Match<undefined>,
        {score: 30, tokenScore: 60} as Match<undefined>,
        {score: 10, tokenScore: 20} as Match<undefined>,
        {score: 25, tokenScore: 12} as Match<undefined>,
        {score: 0, tokenScore: 30} as Match<undefined>,
      ];
      const orderedMatches = orderMatches(matches);
  
      expect(matches.length).toBe(orderedMatches.length);
      expect(orderedMatches).toEqual([
        {score: 100, tokenScore: 20},
        {score: 50, tokenScore: 60},
        {score: 30, tokenScore: 60},
        {score: 0, tokenScore: 30},
        {score: 25, tokenScore: 12},
        {score: 10, tokenScore: 20},
      ]);
    });

    it('By completeness', () => {
      const matches: Match<undefined>[] = [
        {score: 100, tokenScore: 100, completeness: 85} as Match<undefined>,
        {score: 100, tokenScore: 100, completeness: 100} as Match<undefined>,
      ];
      const orderedMatches = orderMatches(matches);

      expect(matches.length).toBe(orderedMatches.length);
      expect(orderedMatches).toEqual([
        {score: 100, tokenScore: 100, completeness: 100} as Match<undefined>,
        {score: 100, tokenScore: 100, completeness: 85} as Match<undefined>,
      ]);
    });

    it('By tokenMatches', () => {
      const matches: Match<undefined>[] = [
        {score: 100, tokenScore: 100, completeness: 100, tokenMatches: [{}]} as Match<undefined>,
        {score: 100, tokenScore: 100, completeness: 100, tokenMatches: [{}, {}]} as Match<undefined>,
      ];
      const orderedMatches = orderMatches(matches);

      expect(matches.length).toBe(orderedMatches.length);
      expect(orderedMatches).toEqual([
        {score: 100, tokenScore: 100, completeness: 100, tokenMatches: [{}, {}]} as Match<undefined>,
        {score: 100, tokenScore: 100, completeness: 100, tokenMatches: [{}]} as Match<undefined>,
      ]);
    });
  });

  it('getCompleteness', () => {
    let completeness = getCompleteness('Cervantes', 'Miguel de Cervantes', 100);
    expect(completeness).toBeCloseTo(100 * 9/19);
    completeness = getCompleteness('Cervetae', 'Miguel de Cervantes', 50);
    expect(completeness).toBeCloseTo(100 * 0.5 * 8/19);
  });

  it('removeAccents', () => {
    const originalWord: string = 'ábcdèfghîjklmnñopqrstüvwxyz';
    const unaccentedWord: string = removeAccents(originalWord);

    expect(unaccentedWord).toBe('abcdefghijklmnnopqrstuvwxyz');
  });

  it('applySensitiveness', () => {
    const originalWord: string = 'áBCdèfgHîjklmnñOpqrstüVWxYz';
    let newWord: string = applySensitiveness(originalWord, {accentSensitive: false, caseSensitive: false} as CockatooOptions);
    expect(newWord).toBe('abcdefghijklmnnopqrstuvwxyz');

    newWord = applySensitiveness(originalWord, {accentSensitive: false, caseSensitive: true} as CockatooOptions);
    expect(newWord).toBe('aBCdefgHijklmnnOpqrstuVWxYz');

    newWord = applySensitiveness(originalWord, {accentSensitive: true, caseSensitive: true} as CockatooOptions);
    expect(newWord).toBe('áBCdèfgHîjklmnñOpqrstüVWxYz');
  });
});