import { VannaFeature } from "./types";
import { VannaSource } from "./source";

interface Mapping<T> {
  [key: string]: T;
}

type VannaFeatureMapping = Mapping<VannaFeature>;

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

export function resolveVariation(feature: VannaFeature, options: VannaOptions) {
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

interface VannaOptions {
  userId?: string;
  target?: string;
  sources: VannaSource[];
}

export class FeatureClient {
  options: VannaOptions;
  featureMapping: VannaFeatureMapping;

  constructor(options: VannaOptions) {
    this.options = options;

    const featuresList = options.sources
      .filter(s => s.kind === "sync")
      .map(s => s.fn());
    this.featureMapping = mergeFeatures(featuresList);
  }

  variation(featureName: string): boolean {
    const feature: VannaFeature = this.featureMapping[featureName];
    if (!feature) {
      throw new Error(`Could not find feature by name: ${featureName}`);
    }

    return resolveVariation(feature, this.options);
  }
}
