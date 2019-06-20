[![Stability](https://img.shields.io/badge/Stability-Under%20Active%20Development-Red.svg)](https://github.com/pbs/vanna-js-client)

# Warning: Under Active Development

This library is under active development and likely to change further before
stabilizing.

# Vanna Javascript (Browser) Client

`vanna` is a feature flagging library we use at [PBS](http://pbs.org). It helps
us deliver new features or refactor existing ones quickly and safely.

&nbsp;

## Getting Started

The recommended way to install `vanna` is through `npm`.

```sh
npm install @pbs/vanna
```

After installing `vanna`, you can import it with your Javascript bundler of
choice and setup the client.

```js
import { FeatureClient } from "@pbs/vanna";

const client = new FeatureClient({
  features: [
    {
      id: "your-feature-slug",
      type: "boolean",
      value: true
    }
  ]
});

const isFeatureEnabled = client.variation("your-feature-slug");
if (isFeatureEnabled) {
  // Do something if feature is enabled
} else {
  // Do another thing if feature is disabled
}
```

&nbsp;

## API

`vanna` has a fairly small API surface of just `Features` and `Clients`. Here's
an example snippet of code that pulls features from code and local storage.

```js
import { FeatureClient, mergeFeatures } from "@pbs/vanna";

const defaultFeatures = [
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

let storedFeatures = []
try {
  storedFeatures = JSON.parse(localStorage.getItem("featureflags"))
} catch (e) {
  // Do nothing
}

const client = new FeatureClient({
  userId: "u123456789",
  target: "beta-tester",
  features: mergeFeatures(defaultFeatures, storedFeatures),
});

const isFeatureEnabled = client.variation("your-feature-slug");
if (isFeatureEnabled) {
  // Do something if feature is enabled
} else {
  // Do another thing if feature is disabled
}
```

### Features

---

A feature is the idea or attribute that you're considering changing in your
application. It could be something small like `new-button-styles` or something
big like `new-website-v2`. Inside `vanna` they are represented as an object with
the following values.

```js
const feature = {
  id: "your-feature-id",
  type: "boolean",
  value: true,
  targets: ["alpha-users"]
};
```

#### `id`

Id is the identifier of name for your feature. It will be a referenced when you
call `client.variation`.

#### `type`

Type can be one of the following values: `boolean`, `percentage`.

A `boolean` feature will be either turned on/off depending on the users. A
`percentage` feature will be turned on/off depending on the users as well as a
seeded random number generator.

#### `value`

Value is a boolean value for your feature. This is the value that
`feature.variation` will resolve to _if_ the user matches the parameter passed
into the feature client. Conversely if the user does _not_ match the parameter
of passed into the feature client, `feature.variation` will resolve to `!value`.

#### `targets`

Target is an optional parameter of a feature that will limit the scope of the
feature matching. If we declare a list of user types in a feature `target`,
`feature.variation` will only resolve the `value` of the feature _if_ the
`target` passed into the client matches one of the feature's `targets`. If a
target is not present in a particular feature, it's assumed that the feature
targets all users.

### Clients

---

Clients are the main way that most of your application code will interact with
`vanna`, and they are a container for the list of features that are relevant to
your application.

#### `FeatureClient`

The feature client can be setup with the following parameters. Once setup, we
can get whether a feature is enabled via `FeatureClient.variation`, which will
return a boolean value.

```js
import { FeatureClient } from "@pbs/vanna";

const client = new FeatureClient({
  features: [],
  userId: "u123456789",
  target: "beta-tester"
});

const isEnabled = client.variation("some-feature");
```

#### `features`

Features will take a list of features on client initialization. There are some
helper functions like `mergeFeatures` that will help you combine features lists
that comes from multiples sources like `localStorage`, `cookies`, or event.

#### `userId`

A unique user identifier that will be required if a feature is of type
`percentage`. If the user is an anonymous user, you have to supply a hard-coded
`userId` or generate a unique fingerprint.

#### `target`

A target is a string that describes the user role or group of the user. It will
be used to match against a feature's `target` to determine if a feature applies
to a particular user.

&nbsp;

#### `AsyncFeatureClient`

The asynchronous version of `FeatureClient` is `AsyncFeatureClient`. It takes
all the same parameter as `FeatureClient`, with some important differences. For
example, instead of taking an array of `features`, `AsyncFeatureClient` requires
that a promise that will resolve to an array of features be passed in. Also,
please note that we have to call `AsyncFeatureClient.on('ready')` before we can
start using `AsyncFeatureClient.variation`.

```js
import { AsyncFeatureClient } from "@pbs/vanna";

const client = new AsyncFeatureClient({
  userId: "u123456789",
  target: "beta-tester",
  features: Promise.resolve([]),
  fallbacks: {
    "some-feature": false
  }
});

client.on("ready", () => {
  const isEnabled = feature.variation("some-feature");
});
```

#### `fallback`

`AsyncFeatureClient` requires that a fallback object be passed in during setup.
This ensures that if we fail to resolve the promise from one of its sources, we
can still supply a fallback value to the application.

&nbsp;

## Rationale

To learn more about the rationale behind using feature flags, read these
articles:

- https://martinfowler.com/articles/feature-toggles.html
- https://blog.travis-ci.com/2014-03-04-use-feature-flags-to-ship-changes-with-confidence/

&nbsp;

## Licensing

[MIT](/LICENSE)
