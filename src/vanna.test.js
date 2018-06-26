import { VannaClient } from "./vanna";

import examplePayload from "../data/example.json";

describe("vanna", () => {
  const getPayload = () => Promise.resolve(examplePayload);

  const server = "https://vanna.example.com/";
  const project = "example-project-name";

  it("should have valid example payload", () => {
    expect(examplePayload.features["some-feature"].value).toEqual(true);
    expect(examplePayload.features["another-feature"].value).toEqual(true);
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
