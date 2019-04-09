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

    it("should handle when a target matches", () => {
      const client = new FeatureClient({
        target: "alpha-user",
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

      const isEnabled = client.variation("some-feature");
      expect(isEnabled).toEqual(true);
    });

    it("should handle when a target doesn't match", () => {
      const client = new FeatureClient({
        target: "alpha-user",
        sources: [
          source(() => [
            {
              type: "boolean",
              slug: "some-feature",
              enabled: true,
              targets: ["beta-user"]
            }
          ])
        ]
      });

      const isEnabled = client.variation("some-feature");
      expect(isEnabled).toEqual(false);
    });

    it("should handle featureName mismatch", () => {
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

      expect(() => client.variation("wrong-feature")).toThrow();
    });
  });

  it("should handle multiple sources", () => {
    // todo
  });

  it("should handle multiple sources of the same  feature", () => {
    // todo
  });
});
