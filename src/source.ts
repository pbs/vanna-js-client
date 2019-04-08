import { VannaFeature } from "./types";

export function source(fn: () => VannaFeature) {
  return {
    kind: "source",
    fn
  };
}
