// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { googleGenAIConstructor } = vi.hoisted(() => ({
  googleGenAIConstructor: vi.fn(function MockGoogleGenAI(this: { config: unknown }, config: unknown) {
    this.config = config;
  }),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: googleGenAIConstructor,
}));

const runtimeModuleUrl = new URL(
  '../../build/preinstalled-skills/gemini-image-generation/scripts/gemini-image-runtime.mjs',
  import.meta.url,
);

function clearSkillEnv() {
  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_MODEL_ID;
  delete process.env.GEMINI_BASE_URL;
  delete process.env.MILOCLAW_API_KEY;
  delete process.env.MILOCLAW_MODEL_ID;
  delete process.env.MILOCLAW_BASE_URL;
}

async function loadRuntimeModule() {
  vi.resetModules();
  return import(runtimeModuleUrl.href);
}

describe('gemini-image-generation runtime env resolution', () => {
  beforeEach(() => {
    clearSkillEnv();
    googleGenAIConstructor.mockClear();
  });

  afterEach(() => {
    clearSkillEnv();
  });

  it('uses GEMINI_* env when configured', async () => {
    process.env.GEMINI_API_KEY = 'gemini-key';
    process.env.GEMINI_MODEL_ID = 'gemini-model';
    process.env.GEMINI_BASE_URL = 'https://example.test/';

    const { createGeminiImageClientFromEnv } = await loadRuntimeModule();
    const client = createGeminiImageClientFromEnv();

    expect(client.model).toBe('gemini-model');
    expect(googleGenAIConstructor).toHaveBeenCalledWith({
      apiKey: 'gemini-key',
      httpOptions: { baseUrl: 'https://example.test' },
    });
  });

  it('uses MiloClaw defaults when only MILOCLAW_API_KEY is configured', async () => {
    process.env.MILOCLAW_API_KEY = 'miloclaw-key';

    const { createGeminiImageClientFromEnv } = await loadRuntimeModule();
    const client = createGeminiImageClientFromEnv();

    expect(client.model).toBe('milo-2-image-pro');
    expect(googleGenAIConstructor).toHaveBeenCalledWith({
      apiKey: 'miloclaw-key',
      httpOptions: { baseUrl: 'https://miloclaw-image.breadkim.com' },
    });
  });

  it('allows MiloClaw overrides for model and base URL', async () => {
    process.env.MILOCLAW_API_KEY = 'miloclaw-key';
    process.env.MILOCLAW_MODEL_ID = 'milo-2-image-pro-custom';
    process.env.MILOCLAW_BASE_URL = 'https://custom.miloclaw.test/';

    const { createGeminiImageClientFromEnv } = await loadRuntimeModule();
    const client = createGeminiImageClientFromEnv();

    expect(client.model).toBe('milo-2-image-pro-custom');
    expect(googleGenAIConstructor).toHaveBeenCalledWith({
      apiKey: 'miloclaw-key',
      httpOptions: { baseUrl: 'https://custom.miloclaw.test' },
    });
  });
});
