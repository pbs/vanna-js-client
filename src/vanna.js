import invariant from "invariant";

function getPayloadUrl(server, project) {
  return `${server}/${project}.json`;
}

function getPayload(server, project) {
  const url = getPayloadUrl(server, project);
  return fetch(url).then(r => r.json());
}

export function isFeatureEnabled(feature, { userSegment }) {
  const segmentMatch = feature.targetSegment.includes(userSegment);
  if (!segmentMatch) {
    return false;
  }

  return feature.enabled;
}

export class VannaClient {
  constructor(dependencies = {}) {
    this.options = undefined;
    this.payload = undefined;

    this.setup = this.setup.bind(this);
    this.on = this.on.bind(this);
    this.variation = this.variation.bind(this);

    this.getPayload = dependencies.getPayload || getPayload;
  }

  setup(options = {}) {
    const { server, project, userSegment } = options;
    invariant(server, "server is a required setup parameter");
    invariant(project, "project is a required setup parameter");

    this.options = { server, project, userSegment };
    return { on: this.on, variation: this.variation };
  }

  on(eventName, cb) {
    invariant(
      this.options,
      "setup must be called before events can be attached"
    );
    invariant(eventName === "ready", `${eventName} is not a valid event`);

    const { server, project } = this.options;
    this.getPayload(server, project)
      .then(payload => {
        this.payload = payload;
      })
      .then(cb)
      .catch(() => {
        this.payload = null;
        cb();
      });
  }

  variation(featureName, { fallback }) {
    if (!this.payload) {
      return fallback;
    }

    const { userSegment } = this.options;
    const feature = this.payload.features[featureName];
    invariant(feature, `${featureName} is not a valid feature`);

    return isFeatureEnabled(feature, { userSegment });
  }
}

export default new VannaClient();
