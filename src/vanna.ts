const defaults = require("lodash.defaults");
const isBoolean = require("lodash.isboolean");

function invariant(condition: any, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

// Vanna's internal state is very simple. It starts out at
// READY and can transition to either HAS_MANIFEST or NO_MANIFEST.
// READY represents the state where the client has been
// instanciated but no network call has been made to fetch
// the project manifest that describes all the feature flags.
// HAS_MANIFEST represents the state where the client
// has successfully fetched the manifest.
// NO_MANIFEST represents the state where the client has
// failed to fetch the manifest; fallback values will be used.
type VannaState = "READY" | "HAS_MANIFEST" | "NO_MANIFEST";

interface VannaSegment {
  slug: string;
}

interface VannaFeature {
  slug: string;
  type: "boolean";
  enabled: boolean;
  targetSegment: string[];
}

interface VannaManifestSegments {
  [projectSlug: string]: VannaSegment;
}

interface VannaManifestFeatures {
  [featureSlug: string]: VannaFeature;
}

interface VannaManifest {
  name: string;
  segments: VannaManifestSegments;
  features: VannaManifestFeatures;
}

type ManifestLoader = (uri: string) => Promise<VannaManifest>;

interface VannaSetupOverrides {
  getManifest?: ManifestLoader;
  getFeatureVariation?: any;
}

interface VannaSetupOptions {
  uri: string;
  fallbacks: any;
  userSegment: string;
  _overrides: VannaSetupOverrides;
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

export function getFeatureVariation(feature: any, { userSegment }: any): any {
  const segmentMatch = feature.targetSegment.includes(userSegment);
  if (!segmentMatch) {
    return false;
  }

  return feature.enabled;
}

export class VannaClient {
  state: VannaState;
  options: VannaSetupOptions;
  manifest?: VannaManifest;

  constructor(options: VannaSetupOptions) {
    this.state = "READY";
    this.options = validateOptions(options);
    this.manifest = undefined;

    const instance: any = { on: this.on, variation: this.variation };
    return instance;
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
        // Fetching or parsing the manifest can fail in certain cases.
        // In these cases, we'll have to make sure to serve fallback
        // values for each variant calls.
        this.state = "NO_MANIFEST";
        cb();
      });
  };

  variation = (featureName: any, variationOptions: any = {}) => {
    const { fallbacks, userSegment } = this.options;
    const globalFallback = fallbacks[featureName];
    const variationFallback = variationOptions.fallback;
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
}

export default VannaClient;
