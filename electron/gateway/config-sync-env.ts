export const SUPERVISED_SYSTEMD_ENV_KEYS = [
  'OPENCLAW_SYSTEMD_UNIT',
  'INVOCATION_ID',
  'SYSTEMD_EXEC_PID',
  'JOURNAL_STREAM',
] as const;

export type GatewayEnv = Record<string, string | undefined>;
const MILOCLAW_BOOTSTRAP_API_KEY_PLACEHOLDER = 'clawx-bootstrap-placeholder';

/**
 * OpenClaw CLI treats certain environment variables as systemd supervisor hints.
 * When present in ClawX-owned child-process launches, it can mistakenly enter
 * a supervised process retry loop. Strip those variables so startup follows
 * ClawX lifecycle.
 */
export function stripSystemdSupervisorEnv(env: GatewayEnv): GatewayEnv {
  const next = { ...env };
  for (const key of SUPERVISED_SYSTEMD_ENV_KEYS) {
    delete next[key];
  }
  return next;
}

export function ensureGatewayBootstrapEnv(env: GatewayEnv): GatewayEnv {
  const next = { ...env };
  if (!next.MILOCLAW_API_KEY?.trim()) {
    next.MILOCLAW_API_KEY = MILOCLAW_BOOTSTRAP_API_KEY_PLACEHOLDER;
  }
  return next;
}
