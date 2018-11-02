'use strict';
import { DamerauLevenshtein } from "../lib/damerauLevenshtein";

describe('DamerauLevenshtein Class', () => {
  it('getDistance', () => {
    const damLev = new DamerauLevenshtein();
    let distance = damLev.getDistance('polo', 'ploo');
    expect(distance).toBe(1);
    
    distance = damLev.getDistance('qixote', 'Quijote');
    expect(distance).toBe(3);

    distance = damLev.getDistance('Qixotea', 'Quijote');
    expect(distance).toBe(3);

    distance = damLev.getDistance('trying', 'a');
    expect(distance).toBe(6);
  });
});