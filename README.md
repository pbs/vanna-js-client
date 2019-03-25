[![Stability](https://img.shields.io/badge/Stability-Under%20Active%20Development-Red.svg)](https://github.com/pbs/vanna-js-client)

# Warning: Under Active Development

This library is under active development and likely to change further before
stabilizing.

# Vanna Javascript (Browser) Client

## Introduction

`vanna` is a feature flagging library we use at [PBS](http://pbs.org). It
helps us deliver new features to users quickly and safely.

## Getting Started

The recommended way to install `vanna` is through `npm`.

```sh
npm install @pbs/vanna
```

After installing `vanna`, you can import it with your Javascript bundler of
choice and setup the client.

```js
import { FeatureClient, InMemorySource } from "@pbs/vanna";

const source = InMemorySource(() => [
  {
    id: "your-feature-slug",
    type: "boolean",
    value: true
  }
]);

const features = FeatureClient({ sources: [source] });

const isFeatureEnabled = features.variation("your-feature-slug");
if (isFeatureEnabled) {
  // Do something if feature is enabled
} else {
  // Do another thing if feature is disabled
}
```

## Rationale

To learn more about the rationale behind using feature flags, read these
articles:

- https://martinfowler.com/articles/feature-toggles.html
- https://blog.travis-ci.com/2014-03-04-use-feature-flags-to-ship-changes-with-confidence/

## Licensing

[MIT](/LICENSE)
