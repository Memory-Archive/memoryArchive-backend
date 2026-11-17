import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

// Promisified manually because util.promisify drops the `options` overload typing.
const scrypt = (password: string, salt: Buffer, keylen: number, options: ScryptOptions): Promise<Buffer> =>
  new Promise((resolve, reject) =>
    scryptCb(password, salt, keylen, options, (err, key) => (err ? reject(err) : resolve(key))),
  );

// OWASP-recommended scrypt cost: N=2^17, r=8, p=1 (~128 MB memory per hash).
const PARAMS = { N: 2 ** 17, r: 8, p: 1 };
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const MAXMEM = 256 * 1024 * 1024; // must exceed 128 * N * r

/**
 * Hashes a password with scrypt and a random salt.
 * Output format: `scrypt$N$r$p$<salt b64>$<hash b64>` so the cost can be raised later
 * without breaking existing hashes.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(SALT_LENGTH);
  const key = await scrypt(password, salt, KEY_LENGTH, { ...PARAMS, maxmem: MAXMEM });
  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64"), key.toString("base64")].join("$");
};

/** Constant-time check of a password against a hash produced by `hashPassword`. */
export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [algo, n, r, p, saltB64, hashB64] = stored.split("$");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;

  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: MAXMEM,
  });
  return timingSafeEqual(actual, expected);
};
