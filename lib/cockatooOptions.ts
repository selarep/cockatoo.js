export class CockatooOptions {
  caseSensitive: boolean = false;
  accentSensitive: boolean = false;

  threshold: number = 40;
  tokenize: boolean = true;
  tokenThreshold: number = 40;
  sorted: boolean = true;

  exhaustive: boolean = false;
  
  keys: string[];

  constructor(obj: {
    caseSensitive?: boolean,
    accentSensitive?: boolean,
    threshold?: number,
    tokenize?: boolean,
    tokenThreshold?: number,
    sorted?: boolean,
    exhaustive?: boolean,
    keys?: string[]
  }) {
    this.caseSensitive = obj.caseSensitive !== undefined ? obj.caseSensitive : false;
    this.accentSensitive = obj.accentSensitive !== undefined ? obj.accentSensitive : false;
    this.threshold = obj.threshold !== undefined ? obj.threshold : 40;
    this.tokenize = obj.tokenize !== undefined ? obj.tokenize : true;
    this.tokenThreshold = obj.tokenThreshold !== undefined ? obj.tokenThreshold : 40;
    this.sorted = obj.sorted !== undefined ? obj.sorted : true;
    this.exhaustive = obj.exhaustive !== undefined ? obj.exhaustive : false;
    this.keys = obj.keys ? obj.keys : [];
  }
}