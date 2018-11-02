export class TokenMatch {
  searchToken: string;
  patternToken: string;
  score: number;
  completeness: number;

  constructor(obj: any) {
    this.searchToken = obj.searchToken;
    this.patternToken = obj.patternToken;
    this.score = obj.score;
    this.completeness = obj.completeness;
  }
}