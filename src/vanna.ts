const defaults = require("lodash.defaults");
const includes = require("lodash.includes");
const isBoolean = require("lodash.isboolean");

function invariant(condition: any, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

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

type VannaFeature = VannaBooleanFeature | VannaPercentageFeature;

interface VannaManifest {
  name: string;
  segments: {
    [projectSlug: string]: VannaSegment;
  };
  features: {
    [featureSlug: string]: VannaFeature;
  };
}

type ManifestLoader = (uri: string, timeout?: number) => Promise<VannaManifest>;
type FeatureVariationResolver = (
  context: DeepPartial<VannaContext>,
  feature: VannaFeature
) => boolean;

interface VannaSetupOptions {
  uri: string;
  userId: string;
  userSegment: string;
  timeout?: number;
  fallbacks: {
    [featureSlug: string]: boolean;
  };
  _overrides?: {
    getManifest?: ManifestLoader;
    resolveFeature?: FeatureVariationResolver;
  };
}

interface VannaContext {
  state: VannaState;
  options: VannaSetupOptions;
  manifest?: VannaManifest;
}

interface VannaVariationOptions {
  fallback?: boolean;
}

export function validateOptions(options: VannaSetupOptions): VannaSetupOptions {
  invariant(options, "missing vanna setup options");

  const { uri, userId, userSegment } = options;
  invariant(uri, "uri is a required setup parameter");
  invariant(userId, "userId is a required setup parameter");
  invariant(userSegment, "userSegment is a required setup parameter");
  return defaults(options, { fallbacks: {} });
}

export function getManifest(
  uri: string,
  timeout?: number
): Promise<VannaManifest> {
  const timeoutSentinel = "TIMEOUT";
  const timeoutPromise = new Promise(resolve => {
    setTimeout(resolve, timeout || 1000);
  });
  const fetchedPromise = fetch(uri).then(r => r.json());
  return Promise.race([timeoutPromise, fetchedPromise]).then(data => {
    if (data === timeoutSentinel) {
      throw new Error("Manifest fetching timed out");
    }
    return data;
  });
}

export function featureVariationResolver(
  context: DeepPartial<VannaContext>,
  feature: VannaFeature
): boolean {
  const userSegment = context.options && context.options.userSegment;
  const segmentMatch = includes(feature.targetSegment, userSegment);
  if (!segmentMatch) {
    return false;
  }

  if (feature.type === "boolean") {
    return feature.enabled;
  }

  if (feature.type === "percentage") {
    return false;
  }

  return false;
}

export function getVariation(
  context: VannaContext,
  featureName: string,
  variationOptions?: VannaVariationOptions
) {
  const { state, options, manifest } = context;
  const { _overrides } = options;

  // Check that we're using the featureVariation after manifest has been fetched
  invariant(
    state !== "INITIALIZED",
    "variation cannot be called before the ready callback"
  );

  // Check for fallbacks regardless of whether fallback is used
  const globalFallback = options.fallbacks[featureName];
  const variationFallback = variationOptions && variationOptions.fallback;
  const hasFallback = isBoolean(globalFallback) || isBoolean(variationFallback);
  invariant(
    hasFallback,
    "feature fallback must be set globally or per variation call"
  );

  // Return fallback if a manifest were not fetched
  if (state === "NO_MANIFEST") {
    if (isBoolean(globalFallback)) {
      return globalFallback;
    }
    return variationFallback;
  }

  // Check that featureName is a valid feature
  const feature = manifest && manifest.features[featureName];
  invariant(feature, `${featureName} is not a valid feature`);
  if (!feature) {
    if (isBoolean(globalFallback)) {
      return globalFallback;
    }
    return variationFallback;
  }
  const resolver =
    (_overrides && _overrides.resolveFeature) || featureVariationResolver;
  return resolver(context, feature);
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
    const { uri, timeout, _overrides } = this.options;
    const manifestLoader: ManifestLoader =
      (_overrides && _overrides.getManifest) || getManifest;

    manifestLoader(uri, timeout)
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
    const state = this.state;
    const options = this.options;
    const manifest = this.manifest;
    return getVariation(
      { state, options, manifest },
      featureName,
      variationOptions
    );
  };
}

export default VannaClient;
