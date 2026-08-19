window.CRIA_PATCH_SAMBANOVA = function(html) {
  if (html.indexOf('label: "SambaNova"') >= 0 && html.indexOf('CRIA_SAMBA_B64') >= 0) return html;

  var b64line = 'var CRIA_SAMBA_B64="NDI2MjI4ZjMtMGJkZC00ZTgzLTlmMDYtNTc2YjQ4NzY4ZWNi";\n';

  if (html.indexOf('CRIA_SAMBA_B64') < 0) {
    html = html.replace(
      'const PROVIDERS = {',
      b64line + 'const PROVIDERS = {'
    );
  }

  if (html.indexOf('label: "SambaNova"') < 0) {
    // Add provider — use Llama 3.3 70B (production)
    html = html.replace(
      'mistral: { label: "Mistral", needsKey: true, model: "mistral-small-latest", vision: false },\n};',
      'mistral: { label: "Mistral", needsKey: true, model: "mistral-small-latest", vision: false },\n  sambanova: { label: "SambaNova", needsKey: true, model: "Meta-Llama-3.3-70B-Instruct", vision: false },\n};'
    );

    // Also after kimi / openai if present
    html = html.replace(
      'kimi: { label: "Kimi", needsKey: true, model: "kimi-k3", vision: true },\n};',
      'kimi: { label: "Kimi", needsKey: true, model: "kimi-k3", vision: true },\n  sambanova: { label: "SambaNova", needsKey: true, model: "Meta-Llama-3.3-70B-Instruct", vision: false },\n};'
    );

    // FALLBACK_ORDER — add near the front for speed
    html = html.replace(
      'const FALLBACK_ORDER = ["claude", "kimi", "groq", "gemini", "deepseek", "openrouter", "cerebras", "mistral"];',
      'const FALLBACK_ORDER = ["claude", "kimi", "sambanova", "groq", "gemini", "deepseek", "openrouter", "cerebras", "mistral"];'
    );
    html = html.replace(
      'const FALLBACK_ORDER = ["claude", "kimi", "groq", "gemini", "deepseek", "openrouter", "cerebras", "mistral", "openai"];',
      'const FALLBACK_ORDER = ["claude", "kimi", "sambanova", "groq", "gemini", "deepseek", "openrouter", "cerebras", "mistral", "openai"];'
    );
    html = html.replace(
      'const FALLBACK_ORDER = ["claude", "groq", "gemini", "deepseek", "openrouter", "cerebras", "mistral"];',
      'const FALLBACK_ORDER = ["claude", "sambanova", "groq", "gemini", "deepseek", "openrouter", "cerebras", "mistral"];'
    );

    // DEFAULT_KEYS
    html = html.replace(
      /(mistral:\s*"[^"]+",)\n\};/,
      '$1\n  sambanova: (typeof atob==="function"?atob(CRIA_SAMBA_B64):""),\n};'
    );
    html = html.replace(
      /(kimi:\s*\(typeof atob==="function"\?atob\(CRIA_KIMI_B64\):""\),)\n\};/,
      '$1\n  sambanova: (typeof atob==="function"?atob(CRIA_SAMBA_B64):""),\n};'
    );

    // keys state
    html = html.replace(
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", sambanova: "" });'
    );
    html = html.replace(
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", openai: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", openai: "", sambanova: "" });'
    );
    html = html.replace(
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", openai: "", kimi: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", openai: "", kimi: "", sambanova: "" });'
    );
    html = html.replace(
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", kimi: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", kimi: "", sambanova: "" });'
    );

    // callByProviderKey
    var sambaBlock =
      'if (providerKey === "sambanova")\n' +
      '        return callOpenAICompatible({\n' +
      '          url: "https://api.sambanova.ai/v1/chat/completions",\n' +
      '          key: getKey("sambanova"),\n' +
      '          model: cfg.model,\n' +
      '          history,\n' +
      '          systemPrompt,\n' +
      '        });\n';

    html = html.replace(
      'if (providerKey === "mistral")\n        return callOpenAICompatible({\n          url: "https://api.mistral.ai/v1/chat/completions",\n          key: getKey("mistral"),\n          model: cfg.model,\n          history,\n          systemPrompt,\n        });\n      return "";',
      'if (providerKey === "mistral")\n        return callOpenAICompatible({\n          url: "https://api.mistral.ai/v1/chat/completions",\n          key: getKey("mistral"),\n          model: cfg.model,\n          history,\n          systemPrompt,\n        });\n      ' + sambaBlock + '      return "";'
    );

    html = html.replace(
      /if \(providerKey === "kimi"\) \{[\s\S]*?return data\?\.choices\?\.\[0\]\?\.message\?\.content \|\| "";\n\s*\}\n\s*return "";/,
      function(match) {
        return match.replace('return "";', sambaBlock + '      return "";');
      }
    );

    // KeyField in settings
    html = html.replace(
      '<KeyField label="Chave 6 (Mistral)" value={keys.mistral} onChange={(v) => updateKey("mistral", v)} hint="console.mistral.ai" />',
      '<KeyField label="Chave 6 (Mistral)" value={keys.mistral} onChange={(v) => updateKey("mistral", v)} hint="console.mistral.ai" />\n            <KeyField label="Chave SambaNova" value={keys.sambanova} onChange={(v) => updateKey("sambanova", v)} hint="cloud.sambanova.ai" />'
    );
    html = html.replace(
      '<KeyField label="Chave Kimi (Moonshot)" value={keys.kimi} onChange={(v) => updateKey("kimi", v)} hint="platform.kimi.ai" />',
      '<KeyField label="Chave Kimi (Moonshot)" value={keys.kimi} onChange={(v) => updateKey("kimi", v)} hint="platform.kimi.ai" />\n            <KeyField label="Chave SambaNova" value={keys.sambanova} onChange={(v) => updateKey("sambanova", v)} hint="cloud.sambanova.ai" />'
    );
  }

  return html;
};
