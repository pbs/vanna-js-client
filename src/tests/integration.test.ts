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

      expect(client.variation("some-feature")).toEqual(true);
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

      expect(client.variation("some-feature")).toEqual(true);
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

      expect(client.variation("some-feature")).toEqual(false);
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

  describe("multiple target", () => {
    it("should handle features without targets", () => {
      const client = new FeatureClient({
        sources: [
          source(() => [
            {
              type: "boolean",
              slug: "some-feature",
              enabled: true
            }
          ]),
          source(() => [
            {
              type: "boolean",
              slug: "another-feature",
              enabled: true
            }
          ])
        ]
      });

      expect(client.variation("some-feature")).toEqual(true);
      expect(client.variation("another-feature")).toEqual(true);
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
          ]),
          source(() => [
            {
              type: "boolean",
              slug: "another-feature",
              enabled: true,
              targets: ["beta-user"]
            }
          ])
        ]
      });

      expect(() => client.variation("some-feature")).toThrow();
      expect(() => client.variation("another-feature")).toThrow();
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
          ]),
          source(() => [
            {
              type: "boolean",
              slug: "another-feature",
              enabled: true,
              targets: ["alpha-user"]
            }
          ])
        ]
      });

      expect(client.variation("some-feature")).toEqual(true);
      expect(client.variation("another-feature")).toEqual(true);
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
          ]),
          source(() => [
            {
              type: "boolean",
              slug: "another-feature",
              enabled: true,
              targets: ["beta-user"]
            }
          ])
        ]
      });

      expect(client.variation("some-feature")).toEqual(false);
      expect(client.variation("another-feature")).toEqual(false);
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
          ]),
          source(() => [
            {
              type: "boolean",
              slug: "another-feature",
              enabled: true
            }
          ])
        ]
      });

      expect(() => client.variation("wrong-feature")).toThrow();
    });
  });
});
