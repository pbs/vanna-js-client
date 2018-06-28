import { VannaClient, isFeatureEnabled } from "./vanna";

import examplePayload from "../data/example.json";

describe("vanna client interface", () => {
  const getPayload = () => Promise.resolve(examplePayload);

  const server = "https://vanna.example.com/";
  const project = "example-project-name";

  it("should have valid example payload", () => {
    expect(examplePayload.features["some-feature"].enabled).toEqual(true);
    expect(examplePayload.features["another-feature"].enabled).toEqual(true);
    expect(examplePayload.features["disabled-feature"].enabled).toEqual(false);
  });

  it("should setup client and get values", cb => {
    const vanna = new VannaClient({ getPayload });
    const client = vanna.setup({ server, project });

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
  describe("isFeatureEnabled helper", () => {
    it("should handle user segment matching", () => {
      const feature = {
        type: "boolean",
        enabled: true,
        targetSegment: ["some-segment"]
      };
      const userSegment = "some-segment";

      const actual = isFeatureEnabled(feature, { userSegment });
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

      const actual = isFeatureEnabled(feature, { userSegment });
      const expected = false;
      expect(actual).toEqual(expected);
    });
  });
});
