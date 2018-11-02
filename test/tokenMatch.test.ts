'use strict'
import { TokenMatch } from "../lib";

describe('TokenMatch Class', () => {
  it('create entity properly', () => {
    const match = new TokenMatch({
      searchToken: 'asdf',
      patternToken: 'asdf',
      score: 100,
      completeness: 100,
    });
    expect(match).toEqual({
      searchToken: 'asdf',
      patternToken: 'asdf',
      score: 100,
      completeness: 100,
    });
  });
});