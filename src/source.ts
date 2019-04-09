import { VannaFeature } from "./types";

export interface VannaSource {
  kind: "sync";
  fn: () => VannaFeature[];
}

export function source(fn: () => VannaFeature[]): VannaSource {
  return {
    kind: "sync",
    fn
  };
}
