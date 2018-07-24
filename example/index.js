import { VannaClient } from "../src/vanna";

import exampleManifest from "../data/example.json";

const client = new VannaClient({
  uri: "https://vanna.example.com/project-manifest",
  userSegment: "alpha-users",
  fallbacks: {
    "some-feature": false
  },
  _overrides: {
    getManifest: () => Promise.resolve(exampleManifest)
  }
});

client.on("ready", () => {
  const isSomeFeatureEnabled = client.variation("some-feature");
  if (isSomeFeatureEnabled) {
    console.log("Some feature is enabled :)");
  } else {
    console.log("Some feature is disabled :(");
  }
});
