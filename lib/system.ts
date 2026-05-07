export interface ScoreCategory {
  key: string;
  label: string;
}

export interface SystemConfig {
  trungDois: number[];
  scoreCategories: ScoreCategory[];
}