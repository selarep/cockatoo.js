export class DamerauLevenshtein {
  deletionCost: number = 1;
  insertionCost: number = 1;
  substitutionCost: number = 1;
  transpositionCost: number = 1;

  constructor() {}
  
  getDistance(s1: string, s2: string): number {
    if (undefined == s1 || undefined == s2 || 'string' !== typeof s1
            || 'string' !== typeof s2 || s1.length === 0 || s2.length === 0) {
        return -1;
    }
  
    const s1Length = s1.length;
    const s2Length = s2.length;
  
    let d = this.initMatrix(s1Length, s2Length);
    if (d === null) {
      return -1;
    }
  
    for (var i = 1; i <= s1Length; i++) {
      let costSubst;
      let costTrans;
      for (let j = 1; j <= s2Length; j++) {
        if (s1.charAt(i - 1) === s2.charAt(j - 1)) {
            costSubst = 0;
            costTrans = 0;
        } else {
            costSubst = this.substitutionCost;
            costTrans = this.transpositionCost;
        }
  
        d[i][j] = Math.min(
          d[i - 1][j] + this.deletionCost, // deletion
          d[i][j - 1] + this.insertionCost, // insertion
          d[i - 1][j - 1] + costSubst, // substitution
        );
  
        if (i > 1 && j > 1 && s1.charAt(i - 1) === s2.charAt(j - 2) && s1.charAt(i - 2) === s2.charAt(j - 1)) {
          d[i][j] = Math.min(
            d[i][j],
            d[i - 2][j - 2] + costTrans,
          );
        }
      }
    }
  
    return d[s1Length][s2Length];
  }
  
  private initMatrix(s1Length: number, s2Length: number): number[][] {
    let d: Array<Array<number>> = [];
    for (let i = 0; i <= s1Length; i++) {
      d[i] = [];
      d[i][0] = i;
    }
    for (let j = 0; j <= s2Length; j++) {
      d[0][j] = j;
    }
    return d;
  }
}