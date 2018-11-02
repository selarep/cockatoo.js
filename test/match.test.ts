'use strict'
import { Match } from "../lib";

describe('Match Class', () => {
  it('create entity properly', () => {
    const match = new Match<any>({
      item: '',
      score: 1,
      completeness: 1,
      tokenScore: 1,
      tokenMatches: [],
    });
    expect(match).toEqual({
      item: '',
      score: 1,
      completeness: 1,
      tokenScore: 1,
      tokenMatches: [],
    });
  });
});