import { VannaClient, getFeatureVariation } from "./vanna";

const examplePayload = require("../data/example.json");

describe("vanna client interface", () => {
  const client = new VannaClient({
    uri: "https://vanna.example.com/project",
    _overrides: { getManifest: () => Promise.resolve(examplePayload) }
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

describe("vanna helpers", () => {
  describe("getFeatureVariation helper", () => {
    it("should handle user segment matching", () => {
      const feature = {
        type: "boolean",
        enabled: true,
        targetSegment: ["some-segment"]
      };
      const userSegment = "some-segment";

      const actual = getFeatureVariation(feature, { userSegment });
      const expected = true;
      expect(actual).toEqual(expected);
    });

    it("should handle user segment not matching", () => {
      const feature = {
        type: "boolean",
        enabled: true,
        targetSegment: ["some-segment"]
      };
      const userSegment = "another-segment";

      const actual = getFeatureVariation(feature, { userSegment });
      const expected = false;
      expect(actual).toEqual(expected);
    });
  });
});
