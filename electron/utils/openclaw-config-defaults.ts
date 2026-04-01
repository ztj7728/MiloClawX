function createGeneratedMemorySearchDefaults(): Record<string, unknown> {
  return {
    enabled: true,
    provider: 'openai',
    model: 'milo-embedding-2-small',
    remote: {
      baseUrl: 'https://miloclaw.joyzhi.com/v1',
      apiKey: {
        source: 'env',
        provider: 'default',
        id: 'MILOCLAW_API_KEY',
      },
    },
  };
}

export function ensureGeneratedOpenClawConfigDefaults(config: Record<string, unknown>): void {
  const agents = (
    config.agents && typeof config.agents === 'object' && !Array.isArray(config.agents)
      ? config.agents as Record<string, unknown>
      : {}
  ) as Record<string, unknown>;
  const defaults = (
    agents.defaults && typeof agents.defaults === 'object' && !Array.isArray(agents.defaults)
      ? agents.defaults as Record<string, unknown>
      : {}
  ) as Record<string, unknown>;

  if (defaults.memorySearch === undefined) {
    defaults.memorySearch = createGeneratedMemorySearchDefaults();
  }

  agents.defaults = defaults;
  config.agents = agents;
}
