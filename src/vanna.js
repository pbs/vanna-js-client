import invariant from "invariant";

export function validateOptions(options) {
  const { uri } = options;
  invariant(uri, "uri is a required setup parameter");
  return options;
}

export function getManifest(uri) {
  return fetch(uri).then(r => r.json());
}

export function getFeatureVariation(feature, { userSegment }) {
  const segmentMatch = feature.targetSegment.includes(userSegment);
  if (!segmentMatch) {
    return false;
  }

  return feature.enabled;
}

export class VannaClient {
  constructor(options = {}) {
    this.options = validateOptions(options);
    this.manifest = undefined;

    this.on = this.on.bind(this);
    this.variation = this.variation.bind(this);
    return { on: this.on, variation: this.variation };
  }

  on(eventName, cb) {
    invariant(eventName === "ready", `${eventName} is not a valid event`);
    this.onReady(cb);
  }

  onReady(cb) {
    const { uri, _overrides } = this.options;
    getManifest = _overrides.getManifest || getManifest;
    getManifest(uri)
      .then(manifest => {
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

  variation(featureName, { fallback }) {
    if (!this.manifest) {
      return fallback;
    }

    const { userSegment } = this.options;
    const feature = this.manifest.features[featureName];
    invariant(feature, `${featureName} is not a valid feature`);

    const { _overrides } = this.options;
    const getFeatureVariation =
      _overrides.getFeatureVariation || getFeatureVariation;
    return getFeatureVariation(feature, { userSegment });
  }
}

export default VannaClient;
