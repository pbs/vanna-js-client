import { FeatureClient, source } from "../vanna";

describe("synchronous api", () => {
  it("should handle a single source", () => {
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

    const isFeatureEnabled = client.variation("some-feature");
    expect(isFeatureEnabled).toEqual(true);
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
