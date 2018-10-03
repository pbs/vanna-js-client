[![Stability](https://img.shields.io/badge/Stability-Under%20Active%20Development-Red.svg)](https://github.com/pbs/vanna-js-client)

# Warning: Under Active Development

This library is under active development and likely to change further before
stabilizing.

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
import { VannaClient } from "@pbs/vanna";

const client = VannaClient({
  uri: "https://vanna.example.com/project",
  userSegment: "beta-tester",
  fallbacks: {
    "your-feature-slug": false
  }
});

client.on("ready", () => {
  const isFeatureEnabled = client.variation("your-feature-slug");
  if (isFeatureEnabled) {
    // Do something if feature is enabled
  } else {
    // Do another thing if feature is disabled
  }
});
```

## Licensing

[MIT](/LICENSE)
