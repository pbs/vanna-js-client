import { FeatureClient, source } from "../vanna";

describe("synchronous api", () => {
  describe("single target", () => {
    it("should handle a feature without targets", () => {
      const client = new FeatureClient({
        sources: [
          source(() => [
            {
              type: "boolean",
              slug: "some-feature",
              enabled: true
            }
          ])
        ]
      });

      const isEnabled = client.variation("some-feature");
      expect(isEnabled).toEqual(true);
    });

    it("should throw an error if feature can't match target", () => {
      const client = new FeatureClient({
        sources: [
          source(() => [
            {
              type: "boolean",
              slug: "some-feature",
              enabled: true,
              targets: ["alpha-user"]
            }
          ])
        ]
      });

      expect(() => client.variation("some-feature")).toThrow();
    });
  });

  it("should handle multiple sources", () => {
    // todo
  });

  it("should handle multiple sources of the same  feature", () => {
    // todo
  });

  it("should handle featureName mismatch", () => {
    // todo
  });
});