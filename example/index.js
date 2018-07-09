import { VannaClient } from "../src/vanna";

import exampleManifest from "../data/example.json";

const client = new VannaClient({
  uri: "https://vanna.example.com/project-manifest",
  userSegment: "alpha-users",
  _overrides: {
    getManifest: () => Promise.resolve(exampleManifest)
  }
});

client.on("ready", () => {
  const isSomeFeatureEnabled = client.variation("some-feature", {
    fallback: false
  });
  if (isSomeFeatureEnabled) {
    console.log("Some feature is enabled :)");
  } else {
    console.log("Some feature is disabled :(");
  }
});
