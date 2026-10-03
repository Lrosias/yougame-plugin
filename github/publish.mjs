// The "Publish to YouGame" action (action.yml): GitHub OIDC trusted publishing.
// 1. Ask GitHub for this run's OIDC token (audience https://yougame.co).
// 2. Trade it at /api/git/token for a 30-minute upload-only key for the listing's owner.
// 3. Stage the build with upload-build.mjs (the same uploader agents use).
// 4. Ship it with /api/git/release and a fresh OIDC token, unless this run is a preview (then
//    the build stays staged and the run prints its 24-hour test link).
// YouGame checks each token's repo and ref against the repo linked on the listing's Manage page.
// Docs: https://yougame.co/publish.md ("Ship from GitHub").
import { appendFile, cp, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { uploadBuild } from "../scripts/upload-build.mjs";

const AUDIENCE = "https://yougame.co";
const MAX_NOTES = 2000;
const env = process.env;
const site = (env.YOUGAME_SITE || "https://yougame.co").replace(/\/+$/, "");
const slug = (env.YOUGAME_SLUG || "").trim();
const kind = (env.YOUGAME_KIND || "minor").trim();
const pkg = (env.YOUGAME_PACKAGE || "").trim() === "true";
const preview = (env.YOUGAME_PREVIEW || "").trim() === "true";

/** A workflow-command message: GitHub reads %, CR and LF in it as escapes. */
const escape = (s) => String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");

function fail(message) {
  console.log(`::error title=YouGame::${escape(message)}`);
  process.exit(1);
}

async function oidcToken() {
  if (!env.ACTIONS_ID_TOKEN_REQUEST_URL || !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN)
    fail("GitHub gave this job no OIDC token. Add `permissions: { contents: read, id-token: write }` to the workflow (or the job).");
  const url = `${env.ACTIONS_ID_TOKEN_REQUEST_URL}&audience=${encodeURIComponent(AUDIENCE)}`;
  const res = await fetch(url, { headers: { authorization: `bearer ${env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.value) fail(`GitHub did not hand out an OIDC token (HTTP ${res.status}).`);
  console.log(`::add-mask::${body.value}`);
  return body.value;
}

async function call(path, body) {
  const res = await fetch(`${site}${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${await oidcToken()}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    redirect: "error",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) fail(data.error || `${path}: HTTP ${res.status}`);
  return data;
}

/** The patch notes: the input, else the release's notes, else the head commit's message. */
async function notes() {
  if (env.YOUGAME_NOTES) return env.YOUGAME_NOTES.slice(0, MAX_NOTES);
  try {
    const event = JSON.parse(await readFile(env.GITHUB_EVENT_PATH, "utf8"));
    const text = event.release?.body || event.head_commit?.message || "";
    return String(text).trim().slice(0, MAX_NOTES);
  } catch {
    return "";
  }
}

/**
 * The folder to upload. A folder can carry hidden entries (.git, .github, .env) a build must never
 * hold (YouGame refuses hidden files) and node_modules, so a folder is copied without them first.
 */
async function buildDir(scratch) {
  if (!env.YOUGAME_PATH) fail("Set `path` to the build folder (`.` for a game with no build step).");
  const target = resolve(env.YOUGAME_PATH);
  const info = await stat(target).catch(() => null);
  if (!info) fail(`${env.YOUGAME_PATH} does not exist. Build the game before this step, or fix \`path\`.`);
  if (!info.isDirectory()) return target;
  const copy = join(scratch, "build");
  const skip = (part) => (part.startsWith(".") && part !== "." && part !== "..") || part === "node_modules";
  await cp(target, copy, { recursive: true, filter: (src) => !src.slice(target.length).split(/[\\/]/).some(skip) });
  return copy;
}

function output(name, value) {
  if (env.GITHUB_OUTPUT) return appendFile(env.GITHUB_OUTPUT, `${name}=${String(value ?? "").replace(/[\r\n]/g, " ")}\n`);
}

if (!/^[a-z0-9-]{1,80}$/.test(slug)) fail("Set `slug` to the listing's slug (the part after yougame.co/g/).");
if (kind !== "minor" && kind !== "major") fail("`kind` is minor or major.");
// The OIDC token is good for any YouGame host, so it only ever goes to an HTTPS one (localhost for development).
{
  let u;
  try {
    u = new URL(site);
  } catch {
    fail("`site` is not a URL.");
  }
  if (u.username || u.password || (u.protocol !== "https:" && !(u.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname)))) fail("`site` must be an HTTPS address.");
}

const scratch = await mkdtemp(join(tmpdir(), "yougame-action-"));
try {
  const dir = await buildDir(scratch);
  const { token } = await call("/api/git/token", { slug });
  console.log(`::add-mask::${token}`);
  let staged;
  try {
    staged = await uploadBuild(dir, { token, site, package: pkg });
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e));
  }
  if (staged.report) console.log(staged.report);
  if (staged.verdict === "broken") fail("YouGame's checks found this build broken (report above). Nothing was released.");
  if (staged.testUrl) await output("test-url", staged.testUrl);
  if (preview) {
    const line = `Preview staged (nothing shipped): ${staged.testUrl || staged.uploadId}. The link works for 24 hours. Publish a GitHub release to ship a version.`;
    console.log(line);
    if (env.GITHUB_STEP_SUMMARY) await appendFile(env.GITHUB_STEP_SUMMARY, `### YouGame preview\n\n${line}\n`);
    process.exit(0);
  }
  const r = await call("/api/git/release", { slug, uploadId: staged.uploadId, kind, notes: await notes() });
  for (const w of r.warnings ?? []) console.log(`::warning title=YouGame::${escape(w)}`);
  await output("version", r.version);
  await output("url", r.url);
  await output("held", r.held ? "true" : "false");
  const line = r.held
    ? `Version ${r.version} of ${r.url} is waiting for YouGame's safety review. The live version stays until it is approved.`
    : r.existing
      ? `${r.url} already runs version ${r.version} from this build.`
      : `Released version ${r.version}: ${r.url}`;
  console.log(r.held ? `::warning title=YouGame::${escape(line)}` : line);
  if (env.GITHUB_STEP_SUMMARY) await appendFile(env.GITHUB_STEP_SUMMARY, `### YouGame\n\n${line}\n`);
} finally {
  await rm(scratch, { recursive: true, force: true });
}
