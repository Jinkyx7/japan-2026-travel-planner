import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { runInNewContext } from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root));
const manifest = JSON.parse(read("dist/manifest.webmanifest"));
const worker = read("dist/sw.js").toString();
let precache = [],
  routes = [],
  message;
let skips = 0;
const workbox = {
  precacheAndRoute(entries) {
    precache = entries;
  },
  cleanupOutdatedCaches() {},
  createHandlerBoundToURL(url) {
    return url;
  },
  NavigationRoute: class {
    constructor(handler, options) {
      this.handler = handler;
      this.options = options;
    }
  },
  registerRoute(route) {
    routes.push(route);
  },
};
const define = (_dependencies, factory) => factory(workbox);
runInNewContext(worker, {
  self: {
    define,
    addEventListener(_name, callback) {
      message = callback;
    },
    skipWaiting() {
      skips++;
    },
  },
  define,
});
function files(path) {
  return readdirSync(new URL(path, root), { withFileTypes: true }).flatMap(
    (item) =>
      item.isDirectory()
        ? files(`${path}/${item.name}`)
        : [`${path}/${item.name}`],
  );
}

test("install manifest has standalone launch, stable scope and real PNG icons", () => {
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.id, "/");
  for (const icon of manifest.icons) {
    const bytes = read(`dist${icon.src}`);
    assert.equal(bytes.subarray(1, 4).toString(), "PNG");
    assert.equal(
      `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`,
      icon.sizes,
    );
  }
  assert.ok(manifest.icons.some((icon) => icon.purpose === "maskable"));
  assert.match(read("dist/index.html").toString(), /apple-touch-icon/);
});

test("every bundled photo and app asset is available on the first offline visit", () => {
  const cached = new Set(precache.map((entry) => entry.url));
  for (const file of [...files("public"), ...files("dist/assets")]) {
    const url = file.replace(/^(public|dist)\//, "");
    assert.ok(cached.has(url), `${url} missing from offline cache`);
  }
  assert.ok(cached.has("index.html"));
  assert.ok([...cached].every((url) => !/^https?:/.test(url)));
});

test("deep links use the app shell; API/Google responses are not runtime cached", () => {
  assert.equal(routes.length, 1);
  assert.equal(routes[0].handler, "/index.html");
  assert.ok(
    routes[0].options.denylist.some((pattern) => pattern.test("/api/private")),
  );
  assert.ok(
    !routes[0].options.denylist.some((pattern) =>
      pattern.test("/itinerary/dec-22/stops/canal"),
    ),
  );
  const config = JSON.parse(read("vercel.json"));
  const rewrite = new RegExp(`^${config.rewrites[0].source}$`);
  assert.ok(rewrite.test("/itinerary/dec-22"));
  for (const path of [
    "/sw.js",
    "/manifest.webmanifest",
    "/icons/icon-192.png",
    "/workbox-example.js",
  ])
    assert.ok(!rewrite.test(path), `${path} must be served directly`);
});

test("a new worker waits until the user explicitly accepts the update", () => {
  assert.equal(skips, 0);
  message({ data: { type: "OTHER" } });
  assert.equal(skips, 0);
  message({ data: { type: "SKIP_WAITING" } });
  assert.equal(skips, 1);
});
