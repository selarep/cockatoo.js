'use strict';
import { Cockatoo } from '../lib/index';
import { orderMatches, damLevDistance } from '../lib/utils';
import { performance } from 'perf_hooks';

const models = require('./models.json').map(m => {
  return {model: m.model, brand: m.brand, searchable: m.brand + ' ' + m.model};
});

describe('Cockatoo.js module', () => {
  const cockatoo = new Cockatoo();

  it('should order matches properly', async () => {
    const matches = [
      {score: 50, tokenScore: 60},
      {score: 100, tokenScore: 20},
      {score: 30, tokenScore: 70},
      {score: 10, tokenScore: 20},
      {score: 25, tokenScore: 12},
      {score: 0, tokenScore: 30},
    ];
    const orderedMatches = orderMatches(matches, {keys: [], tokenize: true});

    expect(matches.length).toBe(orderedMatches.length);
    expect(orderedMatches).toEqual([
      {score: 100, tokenScore: 20},
      {score: 30, tokenScore: 70},
      {score: 50, tokenScore: 60},
      {score: 0, tokenScore: 30},
      {score: 25, tokenScore: 12},
      {score: 10, tokenScore: 20},
    ]);
  });

  it('should get correct Damerau Levenshtein Distance', async () => {
    let distance: number = await damLevDistance('Volkswagen Polo', 'Volkswagen Polo');
    const ms = performance.now();
    for (let i = 0; i < 100; i++) {
      distance = await damLevDistance('Volkswagen Polo', 'Volkswagen Polo');
    }
    const ms2 = performance.now();
    // console.log(ms2 - ms);
    expect(distance).toBe(0);
  });

  it('testing performance', async () => {
    let result;
    const ms = performance.now();
    result = await cockatoo.search('Polo Variant', models, {keys: ['model'], exhaustive: false});
    const ms2 = performance.now();
    console.log(ms2 - ms);
    console.log(result.slice(0, 8));
    expect(0).toBe(0);
  });

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
});