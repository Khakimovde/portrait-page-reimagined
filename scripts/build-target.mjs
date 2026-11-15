// Lovable deploys the Cloud API; local builds export only the static frontend.
export function buildTarget(env) {
  return env.LOVABLE_NITRO_PRESET || env.LOVABLE_SANDBOX === "1" || env.SANDBOX
    ? "cloud"
    : "static";
}