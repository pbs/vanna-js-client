export interface VannaBooleanFeature {
  type: "boolean";
  slug: string;
  enabled: boolean;
  targetSegment: string[];
}

export interface VannaPercentageFeature {
  type: "percentage";
  slug: string;
  percentageEnabled: number;
  targetSegment: string[];
}

export type VannaFeature = VannaBooleanFeature | VannaPercentageFeature;
