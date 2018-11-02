import { TokenMatch } from "./tokenMatch";

export class Match<T> {
  item: T;
  score: number;
  completeness: number;
  tokenScore: number;
  tokenMatches: TokenMatch[];

  constructor(obj: any) {
    this.item = obj.item;
    this.score = obj.score;
    this.completeness = obj.completeness;
    this.tokenScore = obj.tokenScore;
    this.tokenMatches = obj.tokenMatches;
  }
}