'use strict';
import { Cockatoo, Match, CockatooOptions, TokenMatch } from '../lib/index';

import { performance } from 'perf_hooks';
import { DamerauLevenshtein } from '../lib/damerauLevenshtein';

describe('Cockatoo class', () => {
  const elementsList = [
    {author: `Miguel de Cervantes`, title: `Don Quijote de la Mancha`},
    {author: `Antonio Buero Vallejo`, title: `El Tragaluz`},
    {author: `William Shakespeare`, title: `The Winter's Tale`},
  ]
  const cockatoo = new Cockatoo(elementsList, new CockatooOptions({keys: ['title'], exhaustive: false}));

  describe('Create entity properly', () => {
    it('cache sould be empty', () => {
      expect(cockatoo.cache).toEqual({});
    });

    it('elementsList should be equal as related input parameter', () => {
      expect(cockatoo.elementsList).toEqual(elementsList);
    });

    it('options should be created properly', () => {
      expect(cockatoo.options).toEqual(new CockatooOptions({keys: ['title'], exhaustive: false}));
    });

    it('value lists should be created properly', () => {
      expect(cockatoo.originalValuesList).toEqual([[`Don Quijote de la Mancha`], [`El Tragaluz`], [`The Winter's Tale`]]);
      expect(cockatoo.searchableValuesList).toEqual([[`don quijote de la mancha`], [`el tragaluz`], [`the winter's tale`]]);
    });

    it('tokens lists should be created properly', () => {
      expect(cockatoo.originalTokensList).toEqual([[`Don`, `Quijote`, `de`, `la`, `Mancha`], [`El`, `Tragaluz`], [`The`, `Winter's`, `Tale`]]);
      expect(cockatoo.searchableTokensList).toEqual([[`don`, `quijote`, `de`, `la`, `mancha`], [`el`, `tragaluz`], [`the`, `winter's`, `tale`]]);
    });
  });

  describe('Methods work properly', () => {
    it('getMinDistance', () => {
      let distance = cockatoo.getMinDistance('quijote', 'quijote', { exhaustive: false } as CockatooOptions);
      expect(distance).toBe(0);

      distance = cockatoo.getMinDistance('quijote', 'don quijote', { exhaustive: false } as CockatooOptions);
      expect(distance).toBe(4);

      distance = cockatoo.getMinDistance('quijote', 'don quijote', { exhaustive: true } as CockatooOptions);
      expect(distance).toBe(0);
    });

    it('getScore', () => {
      let score = cockatoo.getScore('quijote', [`don`, `quijote`, `de`, `la`, `mancha`], { exhaustive: false } as CockatooOptions);
      expect(score).toEqual({patternMatch: 'quijote', score: 100});

      score = cockatoo.getScore('quij', [`don`, `quijote`, `de`, `la`, `mancha`], { exhaustive: false } as CockatooOptions);
      expect(score.patternMatch).toEqual('quijote');
      expect(score.score).toBeCloseTo(100);

      score = cockatoo.getScore('qijote', [`don`, `quijote`, `de`, `la`, `mancha`], { exhaustive: false } as CockatooOptions);
      expect(score.patternMatch).toEqual('quijote');
      expect(score.score).toBeCloseTo(5 / 6 * 100);

      score = cockatoo.getScore('mnacha', [`don`, `quijote`, `de`, `la`, `mancha`], { exhaustive: false } as CockatooOptions);
      expect(score.patternMatch).toEqual('mancha');
      expect(score.score).toBeCloseTo(5 / 6 * 100);
    });

    it('getTokenScore', () => {
      let tokenScoreObj = cockatoo.getTokenScore(['quijote'], [`don`, `quijote`, `de`, `la`, `mancha`], ['quijote'], [`Don`, `Quijote`, `de`, `la`, `Mancha`]);
      expect(tokenScoreObj.tokenMatches).toEqual([{completeness: 100, patternToken: 'Quijote', score: 100, searchToken: 'quijote'}]);
      expect(tokenScoreObj.tokenScore).toBeCloseTo(100);

      tokenScoreObj = cockatoo.getTokenScore(['dno', 'quijote'], [`don`, `quijote`, `de`, `la`, `mancha`], ['dno', 'quijote'], [`Don`, `Quijote`, `de`, `la`, `Mancha`]);
      expect(tokenScoreObj.tokenMatches).toEqual([
        { completeness: 100 * 2/3, patternToken: 'Don', score: 100 * 2/3, searchToken: 'dno' },
        { completeness: 100, patternToken: 'Quijote', score: 100, searchToken: 'quijote' },
      ]);
      expect(tokenScoreObj.tokenScore).toBeCloseTo(9/10 * 100);
    });

    it('search', async () => {
      let results = await cockatoo.search('tale');
      expect(results.length).toBe(1);
      expect(results[0].item).toEqual({author: `William Shakespeare`, title: `The Winter's Tale`});
      expect(results[0].score).toBeCloseTo(100 * 1/4);
      expect(results[0].completeness).toBeCloseTo(4/results[0].item.title.length * results[0].score);
      expect(results[0].tokenScore).toBeCloseTo(100);
      expect(results[0].tokenMatches.length).toBe(1);
      expect(results[0].tokenMatches[0].completeness).toBeCloseTo(100);
      expect(results[0].tokenMatches[0].score).toBeCloseTo(100);
      expect(results[0].tokenMatches[0].searchToken).toBe('tale');
      expect(results[0].tokenMatches[0].patternToken).toBe('Tale');
    });

  });
});


const damLev = new DamerauLevenshtein();
it('should get correct Damerau Levenshtein Distance', async () => {
  let distance: number = await damLev.getDistance('Volkswagen Polo', 'Volkswagen Polo');
  const ms = performance.now();
  for (let i = 0; i < 100; i++) {
    distance = await damLev.getDistance('Volkswagen Polo', 'Volkswagen Polo');
  }
  const ms2 = performance.now();
  // console.log(ms2 - ms);
  expect(distance).toBe(0);
});

// it('testing performance', async () => {
//   let result;
//   const ms = performance.now();
//   for (let i = 0; i < 1; i++) {
//     result = await cockatoo.search('a');
//     result = await cockatoo.search('b');
//     result = await cockatoo.search('c');
//     result = await cockatoo.search('d');
//   }
//   const ms2 = performance.now();
//   console.log(ms2 - ms);
//   console.log(Object.keys(cockatoo.cache));
//   // console.log(cockatoo.tokensList);
//   expect(0).toBe(0);
// });

// it('testing performance', async () => {
//   let result;
//   const prepared = new PreparedSearch(models, {keys: ['model'], exhaustive: false});
//   const ms = performance.now();
//   for (let i = 0; i < 1; i++) {
//     result = await cockatoo.preparedSearch('Volkswagen Polo Variant', prepared);
//   }
//   const ms2 = performance.now();
//   console.log(ms2 - ms);
//   expect(0).toBe(0);
// });

// it('testing performance', async () => {
//   let ms = performance.now();
//   for (let i = 0; i < 1000; i++) {
//     getScore('Volkswagen Polo', 'Volkswagen Passat Variant', {keys: [], exhaustive: true});
//   }
//   let ms2 = performance.now();
//   console.log(ms2 - ms);

//   const values = [];
//   for (let i = 0; i < 1000; i++) {
//     values.push('Volkswagen Polo');
//   }
//   ms = performance.now();
//   Bluebird.map(values, (value) => {
//     return getScore(value, 'Volkswagen Passat Variant', {keys: [], exhaustive: true});
//   }, {concurrency: 20})
//   .then(() => {
//     ms2 = performance.now();
//     console.log(ms2 - ms);
//   });
//   expect(0).toBe(0);
// });