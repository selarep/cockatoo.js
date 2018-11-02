'use strict';
import { CockatooOptions } from "../lib";

describe('CockatooOptions Class', () => {
  describe('create entity properly', () => {
    it('default values are correct', () => {
      const options = new CockatooOptions({});
      expect(options).toEqual({
        caseSensitive: false,
        accentSensitive: false,
        threshold: 40,
        tokenize: true,
        tokenThreshold: 40,
        sorted: true,
        exhaustive: false,
        keys: [],
      })
    });

    it('values are correct', () => {
      const options = new CockatooOptions({
        caseSensitive: true,
        accentSensitive: false,
        threshold: 80,
        tokenize: true,
        tokenThreshold: 80,
        sorted: true,
        exhaustive: true,
        keys: ['title'],
      });
      expect(options).toEqual({
        caseSensitive: true,
        accentSensitive: false,
        threshold: 80,
        tokenize: true,
        tokenThreshold: 80,
        sorted: true,
        exhaustive: true,
        keys: ['title'],
      });
    });
  });
});