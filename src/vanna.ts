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

export function validateOptions(options: any): any {
  const { uri } = options;
  invariant(uri, "uri is a required setup parameter");
  return defaults(options, { fallbacks: {} });
}

export function getManifest(uri: any): any {
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
  options: any;
  manifest: any;
  state: VannaState;

  constructor(options: any = {}) {
    this.state = "READY";
    this.options = validateOptions(options);
    this.manifest = undefined;

    const instance: any = { on: this.on, variation: this.variation };
    return instance;
  }

  on = (eventName: any, cb: any) => {
    invariant(eventName === "ready", `${eventName} is not a valid event`);
    this.onReady(cb);
  };

  onReady = (cb: any) => {
    const { uri, _overrides } = this.options;
    (_overrides.getManifest || getManifest)(uri)
      .then((manifest: any) => {
        this.state = "HAS_MANIFEST";
        this.manifest = manifest;
      })
      .then(cb)
      .catch(() => {
        // Fetching or parsing the manifest can fail in certain cases.
        // In these cases, we'll have to make sure to serve fallback
        // values for each variant calls.
        this.state = "NO_MANIFEST";
        this.manifest = null;
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
