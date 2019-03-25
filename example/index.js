import VannaClient from "../dist/vanna";

const client = new VannaClient({
  uri: "http://localhost:2345/data/example.json",
  userId: "u123",
  userSegment: "beta-users",
  fallbacks: {
    "percentage-feature": false
  }
});

client.on("ready", () => {
  const isSomeFeatureEnabled = client.variation("percentage-feature");
  if (isSomeFeatureEnabled) {
    console.log("Some feature is enabled :)");
  } else {
    console.log("Some feature is disabled :(");
  }
});
