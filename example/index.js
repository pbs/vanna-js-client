import VannaClient from "../dist/vanna";

const client = new VannaClient({
  uri: "http://localhost:2345/data/example.json",
  userSegment: "alpha-users",
  fallbacks: {
    "some-feature": false
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
