const defaults = require("lodash.defaults");
const isBoolean = require("lodash.isboolean");

function invariant(condition: any, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

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

  constructor(options: any = {}) {
    this.options = validateOptions(options);
    this.manifest = undefined;

    this.on = this.on.bind(this);
    this.onReady = this.onReady.bind(this);
    this.variation = this.variation.bind(this);
    const instance: any = { on: this.on, variation: this.variation };
    return instance;
  }

  on(eventName: any, cb: any) {
    invariant(eventName === "ready", `${eventName} is not a valid event`);
    this.onReady(cb);
  }

  onReady(cb: any) {
    const { uri, _overrides } = this.options;
    (_overrides.getManifest || getManifest)(uri)
      .then((manifest: any) => {
        this.manifest = manifest;
      })
      .then(cb)
      .catch(() => {
        // Fetching or parsing the manifest can fail in certain cases.
        // In these cases, we'll have to make sure to serve fallback
        // values for each variant calls.
        this.manifest = null;
        cb();
      });
  }

  variation(featureName: any, variationOptions: any = {}) {
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
  }
}

export default VannaClient;
