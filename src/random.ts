const md5 = require("md5");

/**
 * Generate a hashed number based on input string
 * Taken from https://github.com/darkskyapp/string-hash/blob/master/index.js
 */
function hash(str: string): number {
  let hash = 5381;
  let i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  // JavaScript does bitwise operations (like XOR, above) on 32-bit signed
  // integers. Since we want the results to be always positive, convert the
  // signed int to an unsigned by doing an unsigned bitshift.
  return hash >>> 0;
}

/**
 * Generate a random number between 0 and 1 based on a number seed.
 * Taken from https://gist.github.com/blixt/f17b47c62508be59987b
 */
function seededRandom(seed: number): number {
  let paddedSeed = seed + 2147483646;
  let random = (paddedSeed = (paddedSeed * 16807) % 2147483647);
  return (random - 1) / 2147483646;
}

/**
 * Generate a random number between 0 and 100 based on a string seed.
 */
export function seededRandomPercentage(seedStr: string): number {
  return seededRandom(hash(md5(String(seedStr)))) * 100;
}
