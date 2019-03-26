import { VannaBooleanFeature, VannaClient, featureVariationResolver } from "./vanna";

const examplePayload: any = {}; // TODO: fix tests

describe.skip("vanna client interface", () => {
  const client = new VannaClient({
    uri: "https://vanna.example.com/project",
    userId: "u123",
    userSegment: "admin",
    fallbacks: {},
    _overrides: {
      getManifest: __ => Promise.resolve(examplePayload)
    }
  });

  it("should have valid example payload", () => {
    expect(examplePayload.features["some-feature"].enabled).toEqual(true);
    expect(examplePayload.features["another-feature"].enabled).toEqual(true);
    expect(examplePayload.features["disabled-feature"].enabled).toEqual(false);
  });

  it("should setup client and get values", cb => {
    client.on("ready", () => {
      const someFeature = client.variation("some-feature", { fallback: true });
      const anotherFeature = client.variation("another-feature", {
        fallback: true
      });
      expect(someFeature).toEqual(true);
      expect(anotherFeature).toEqual(true);

      cb();
    });
  });
});

describe("getFeatureVariation helper", () => {
  it("should handle user segment matching", () => {
    const userSegment = "some-segment";
    const context = {
      options: { userSegment }
    };

    const feature: VannaBooleanFeature = {
      slug: "some-feature",
      type: "boolean",
      enabled: true,
      targetSegment: ["some-segment"]
    };

    const actual = featureVariationResolver(context, feature);
    expect(actual).toEqual(true);
  });

  it("should handle user segment not matching", () => {
    const userSegment = "another-segment";
    const context = { options: { userSegment } };

    const feature: VannaBooleanFeature = {
      slug: "some-feature",
      type: "boolean",
      enabled: true,
      targetSegment: ["some-segment"]
    };

    const actual = featureVariationResolver(context, feature);
    expect(actual).toEqual(false);
  });
});
