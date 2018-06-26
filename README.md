# Vanna Javascript (Browser) Client

## Introduction

Vanna is an internal feature flagging service used at [PBS](http://pbs.org). It
helps deliver new features to users quickly and safely. This is an example
client implementation for browser based Javascript.

To learn more about the rationale behind using feature flags, read these
articles:

- https://martinfowler.com/articles/feature-toggles.html
- https://blog.travis-ci.com/2014-03-04-use-feature-flags-to-ship-changes-with-confidence/

## Install

The recommended way to install vanna is through `npm`.

```sh
npm install @pbs/vanna
```

## Setup

After installing `vanna`, you can import it with your Javascript bundler of
choice and setup the client.

```js
import vanna from "@pbs/vanna";

const client = vanna.setup({
  server: "https://vanna.example.com/",
  project: "example-project-name",
  userSegment: "beta-tester"
});

client.on("ready", () => {
  const isFeatureEnabled = client.variation("your-feature-slug", {
    fallback: false
  });

  if (isFeatureEnabled) {
    // Do something if feature is enabled
  } else {
    // Do another thing if feature is disabled
  }
});
```

## Licensing

[MIT](/LICENSE)
