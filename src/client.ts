import { VannaFeature } from "./types";

interface Mapping<T> {
  [key: string]: T;
}

type VannaFeatureMapping = Mapping<VannaFeature>;

interface VannaClientOptions {
  userId?: string;
  target?: string;
  features: VannaFeature[];
}

export function mergeFeatures(
  featuresList: VannaFeature[][]
): VannaFeatureMapping {
  const mapping: VannaFeatureMapping = {};
  featuresList.forEach(features => {
    features.forEach(feature => {
      mapping[feature.slug] = feature;
    });
  });

  return mapping;
}

export function resolveVariation(
  feature: VannaFeature,
  options: VannaClientOptions
) {
  const invalidTarget = feature.targets && !options.target;
  if (invalidTarget) {
    throw new Error(
      "Feature has targets, but no target was passed when FeatureClient was setup"
    );
  }

  if (feature.type === "boolean") {
    if (feature.targets) {
      return feature.targets.includes(options.target || "");
    }

    return feature.enabled;
  }

  // TODO: Implement percentage feature flag resolution

  return false;
}

export class FeatureClient {
  options: VannaClientOptions;
  featureMapping: VannaFeatureMapping;

  constructor(options: VannaClientOptions) {
    this.options = options;

    let featureMapping: VannaFeatureMapping = {};
    options.features.forEach(f => {
      featureMapping[f.slug] = f;
    });
    this.featureMapping = featureMapping;
  }

  variation(featureName: string): boolean {
    const feature: VannaFeature = this.featureMapping[featureName];
    if (!feature) {
      throw new Error(`Could not find feature by name: ${featureName}`);
    }

    return resolveVariation(feature, this.options);
  }
}
