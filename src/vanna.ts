const defaults = require("lodash.defaults");
const includes = require("lodash.includes");
const isBoolean = require("lodash.isboolean");

function invariant(condition: any, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

// Vanna's internal state is very simple. It starts out at
// INITIALIZED and can transition to either HAS_MANIFEST or NO_MANIFEST.
// INITIALIZED represents the state when the client has been
// instantiated but no network call has been made to fetch
// the project manifest that describes all of the feature flags.
// HAS_MANIFEST represents the state when the client
// has successfully fetched the manifest.
// NO_MANIFEST represents the state when the client has
// failed to fetch the manifest; fallback values will be used.
type VannaState = "INITIALIZED" | "HAS_MANIFEST" | "NO_MANIFEST";

interface VannaSegment {
  slug: string;
}

interface VannaFeature {
  slug: string;
  type: "boolean";
  enabled: boolean;
  targetSegment: string[];
}

interface VannaManifest {
  name: string;
  segments: {
    [projectSlug: string]: VannaSegment;
  };
  features: {
    [featureSlug: string]: VannaFeature;
  };
}

type ManifestLoader = (uri: string) => Promise<VannaManifest>;

interface VannaSetupOptions {
  uri: string;
  userSegment: string;
  fallbacks: {
    [featureSlug: string]: boolean;
  };
  _overrides: {
    getManifest?: ManifestLoader;
    getFeatureVariation?: any;
  };
}

interface VannaVariationOptions {
  fallback?: boolean;
}

export function validateOptions(options: VannaSetupOptions): VannaSetupOptions {
  invariant(options, "missing vanna setup options");

  const { uri } = options;
  invariant(uri, "uri is a required setup parameter");
  return defaults(options, { fallbacks: {} });
}

export function getManifest(uri: string): Promise<VannaManifest> {
  return fetch(uri).then(r => r.json());
}

export function getFeatureVariation(
  feature: VannaFeature,
  { userSegment }: any
): boolean {
  const segmentMatch = includes(feature.targetSegment, userSegment);
  if (!segmentMatch) {
    return false;
  }

  return feature.enabled;
}

export function getFeatureVariationNext(
  vannaContext: {
    state: VannaState;
    options: VannaSetupOptions;
    manifest?: VannaManifest;
  },
  featureName: string,
  variationOptions?: VannaVariationOptions
) {
  // TODO
}

export class VannaClient {
  state: VannaState;
  options: VannaSetupOptions;
  manifest?: VannaManifest;

  constructor(options: VannaSetupOptions) {
    this.state = "INITIALIZED";
    this.options = validateOptions(options);
    this.manifest = undefined;
  }

  on = (eventName: "ready", cb: () => void) => {
    invariant(eventName === "ready", `${eventName} is not a valid event`);
    this.onReady(cb);
  };

  onReady = (cb: () => void) => {
    const { uri, _overrides } = this.options;
    const manifestLoader: ManifestLoader =
      _overrides.getManifest || getManifest;

    manifestLoader(uri)
      .then(manifest => {
        this.state = "HAS_MANIFEST";
        this.manifest = manifest;
      })
      .then(cb)
      .catch(() => {
        this.state = "NO_MANIFEST";
        cb();
      });
  };

  variation = (
    featureName: string,
    variationOptions?: VannaVariationOptions
  ) => {
    const { fallbacks, userSegment } = this.options;
    const globalFallback = fallbacks[featureName];
    const variationFallback = variationOptions && variationOptions.fallback;
    invariant(
      isBoolean(globalFallback) || isBoolean(variationFallback),
      "feature fallback must be set globally or per variation call"
    );
    if (!this.manifest) {
      if (isBoolean(globalFallback)) {
        return globalFallback;
      }
      return variationFallback;
    }

    const feature = this.manifest.features[featureName];
    invariant(feature, `${featureName} is not a valid feature`);

    const { _overrides } = this.options;
    return (_overrides.getFeatureVariation || getFeatureVariation)(feature, {
      userSegment
    });
  };

  variationNext = (
    featureName: string,
    variationOptions?: VannaVariationOptions
  ) => {
    const state = this.state;
    const options = this.options;
    const manifest = this.manifest;
    return getFeatureVariationNext(
      { state, options, manifest },
      featureName,
      variationOptions
    );
  };
}

export default VannaClient;
