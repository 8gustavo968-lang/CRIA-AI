window.CRIA_PATCH_OPENAI = function(html) {
  if (html.indexOf('label: "ChatGPT"') >= 0) return html;

  html = html.replace(
    'mistral: { label: "Mistral", needsKey: true, model: "mistral-small-latest", vision: false },\n};',
    'mistral: { label: "Mistral", needsKey: true, model: "mistral-small-latest", vision: false },\n  openai: { label: "ChatGPT", needsKey: true, model: "gpt-4o-mini", vision: true },\n};'
  );

  html = html.replace(
    'const FALLBACK_ORDER = ["claude", "groq", "gemini", "deepseek", "openrouter", "cerebras", "mistral"];',
    'const FALLBACK_ORDER = ["claude", "groq", "gemini", "deepseek", "openrouter", "cerebras", "mistral", "openai"];'
  );

  // inject openai default key after mistral line without touching the key value
  html = html.replace(
    /(mistral:\s*"[^"]+",)\n\};/,
    '$1\n  openai: "",\n};'
  );

  html = html.replace(
    'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "" });',
    'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", openai: "" });'
  );

  html = html.replace(
    'if (providerKey === "mistral")\n        return callOpenAICompatible({\n          url: "https://api.mistral.ai/v1/chat/completions",\n          key: getKey("mistral"),\n          model: cfg.model,\n          history,\n          systemPrompt,\n        });\n      return "";',
    'if (providerKey === "mistral")\n        return callOpenAICompatible({\n          url: "https://api.mistral.ai/v1/chat/completions",\n          key: getKey("mistral"),\n          model: cfg.model,\n          history,\n          systemPrompt,\n        });\n      if (providerKey === "openai")\n        return callOpenAICompatible({\n          url: "https://api.openai.com/v1/chat/completions",\n          key: getKey("openai"),\n          model: cfg.model,\n          history,\n          systemPrompt,\n        });\n      return "";'
  );

  html = html.replace(
    '<KeyField label="Chave 6 (Mistral)" value={keys.mistral} onChange={(v) => updateKey("mistral", v)} hint="console.mistral.ai" />',
    '<KeyField label="Chave 6 (Mistral)" value={keys.mistral} onChange={(v) => updateKey("mistral", v)} hint="console.mistral.ai" />\n            <KeyField label="Chave 7 (ChatGPT)" value={keys.openai} onChange={(v) => updateKey("openai", v)} hint="platform.openai.com/api-keys" />'
  );

  return html;
};
