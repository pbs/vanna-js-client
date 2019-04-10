export interface VannaBooleanFeature {
  type: "boolean";
  slug: string;
  enabled: boolean;
  targets?: string[];
}

export interface VannaPercentageFeature {
  type: "percentage";
  slug: string;
  percentageEnabled: number;
  targets?: string[];
}

export type VannaFeature = VannaBooleanFeature | VannaPercentageFeature;
