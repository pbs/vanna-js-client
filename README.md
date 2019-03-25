[![Stability](https://img.shields.io/badge/Stability-Under%20Active%20Development-Red.svg)](https://github.com/pbs/vanna-js-client)

# Warning: Under Active Development

This library is under active development and likely to change further before stabilizing.

# Vanna Javascript (Browser) Client

## Introduction

`vanna` is a feature flagging library we use at [PBS](http://pbs.org). It helps us deliver new
features or refactor existing ones quickly and safely.

## Getting Started

The recommended way to install `vanna` is through `npm`.

```sh
npm install @pbs/vanna
```

After installing `vanna`, you can import it with your Javascript bundler of choice and setup the
client.

```js
import { FeatureClient, Source } from "@pbs/vanna";

const client = FeatureClient({
  sources: [
    Source(() => [
      {
        id: "your-feature-slug",
        type: "boolean",
        value: true
      }
    ])
  ]
});

const isFeatureEnabled = client.variation("your-feature-slug");
if (isFeatureEnabled) {
  // Do something if feature is enabled
} else {
  // Do another thing if feature is disabled
}
```

## API

`vanna`'s API surface consists: `Features`, `Sources`, and `Clients`. `Clients` can have a list of
`Sources`, and `Sources` return a list of `Features`. As an example, here's an example usage of
`vanna` that includes all 3 APIs.

```js
import { FeatureClient, Source } from "@pbs/vanna";

const inMemorySource = Source(() => [
  {
    id: "your-feature-slug",
    type: "boolean",
    value: true,
    targets: ["alpha-tester"]
  },
  {
    id: "another-feature-slug",
    type: "boolean",
    value: true,
    targets: ["beta-tester"]
  }
]);

const localStorageSource = Source(() => JSON.parse(localStorage.get("featureflags")));

const client = FeatureClient({
  sources: [localStorageSource, inMemorySource],
  userId: "u123456789",
  target: "beta-tester"
});

const isFeatureEnabled = client.variation("your-feature-slug");
if (isFeatureEnabled) {
  // Do something if feature is enabled
} else {
  // Do another thing if feature is disabled
}
```

### Features

A feature is the idea or attribute that you're considering changing in your application. It could be
something small like `new-button-styles` or something big like `new-website-v2`. Inside `vanna` they
are represented as an object with the following values.

```js
const feature = {
  id: "your-feature-id",
  type: "boolean",
  value: true,
  targets: ["alpha-users"]
};
```

#### `id`

Id is the identifier of name for your feature. It will be a referenced when you call
`client.variation`.

#### `type`

Type can be one of the following values: `boolean`, `percentage`.

A `boolean` feature will be either turned on/off depending on the users. A `percentage` feature will
be turned on/off depending on the users as well as a seeded random number generator.

#### `value`

Value is a boolean value for your feature. This is the value that `feature.variation` will resolve
to _if_ the users matches the parameter passed into the feature client. Conversely if the user does
_not_ match the parameter of passed into the feature client, `feature.variation` will resolve to
`!value`.

#### `targets`

Target is an optional parameter of a feature that will limit the scope of the feature matching. If
we declare a list of user types in a feature `target`, `feature.variation` will only resolve the
`value` of the feature _if_ the `target` passed into the client matches one of the feature's
`targets`.

### Sources

Sources is a mechanism to fetch features for clients, without sacrificing the flexibility on where
the feature set is stored. Two main types of Sources are provided, to handle synchronous fetching as
well as asynchronous fetching of feature sets. In addition, a feature client can have multiple
sources, and `vanna` will correctly resolve `feature.variation` based on the _order_ of the source
configuration.

#### `Source`

Source is the synchronous resolver for features. It is particularly easy to get started with, and
useful for getting features stored in places where we can get it synchronously, such as in memory
variables, cookies, or `localStorage`. It will take a function that returns a list of features.

```js
import { Source } from "@pbs/vanna";

const source = Source(() => [
  {
    id: "your-feature-id",
    type: "boolean",
    value: true
  }
]);
```

#### `AsyncSource`

AsyncSource is the async version of `Source`. It is useful for getting features from APIs that
involve asynchrony, such as fetching the list of features over the network, or from APIs like
`IndexDB`. It will take a function that returns a promise of a list of features.

```js
import { AsyncSource } from "@pbs/vanna";

AsyncSource(() =>
  Promise.resolve([
    {
      id: "your-feature-id",
      type: "boolean",
      value: true
    }
  ])
);
```

### Clients

To tie the idea of features and sources together, we finally get to clients. Clients are the main
way that most of your application code will interact with `vanna`.

#### `FeatureClient`

The feature client can be setup with the following parameters. Once setup, we can get whether a
feature is enabled via `FeatureClient.variation`, which will return a boolean value.

```js
import { FeatureClient } from "@pbs/vanna";

const client = FeatureClient({
  sources: [],
  userId: "u123456789",
  target: "beta-tester"
});

const isEnabled = client.variation("some-feature");
```

#### `sources`

Sources holds a list of sources. The list _is_ order dependent, and the client will look through the
list one at a time until a matching feature id is found from one of the sources. Note that
`FeatureClient` cannot accept an `AsyncSource`.

#### `userId`

A unique user identifier that will be required if a feature is of type `percentage`. If the user is
an anonymous user, you have to supply a hard-coded userId or generate a unique fingerprint.

#### `target`

A target is a string that describes the user role or group of the user. It will be used to match
against a feature's `target` to determine if a feature applies to a particular user.

#### `AsyncFeatureClient`

The asynchronous version of `FeatureClient` is `AsyncFeatureClient`. It takes all the same parameter
as `FeatureClient`, with some important differences.

In particular, note that we have to call `AsyncFeatureClient.on('ready')` before we can start using
`AsyncFeatureClient.variation`.

```js
import { AsyncFeatureClient } from "@pbs/vanna";

const client = AsyncFeatureClient({
  sources: [],
  userId: "u123456789",
  target: "beta-tester",
  fallbacks: {
    "some-feature": false
  }
});

client.on("ready", () => {
  const isEnabled = feature.variation("some-feature");
});
```

#### `fallback`

`AsyncFeatureClient` requires that a fallback object be passed in during setup. This ensures that if
we fail to resolve the promise from one of its sources, we can still supply a fallback value to the
application.

## Rationale

To learn more about the rationale behind using feature flags, read these articles:

- https://martinfowler.com/articles/feature-toggles.html
- https://blog.travis-ci.com/2014-03-04-use-feature-flags-to-ship-changes-with-confidence/

## Licensing

[MIT](/LICENSE)
