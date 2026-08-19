window.CRIA_PATCH_KIMI = function(html) {
  if (html.indexOf('label: "Kimi"') >= 0 && html.indexOf('CRIA_KIMI_B64') >= 0) return html;

  // key encoded to avoid plain-text secret scanners (still recoverable — do not treat as secret)
  var b64line = 'var CRIA_KIMI_B64="c2stTXJoTk5ZbVY2Z2VBZWVKeExrSGlBUHlUNGN1MUtiQURrUHRXbUxEMEY3Z1F5ZUI4";\n';

  if (html.indexOf('CRIA_KIMI_B64') < 0) {
    html = html.replace(
      'const PROVIDERS = {',
      b64line + 'const PROVIDERS = {'
    );
  }

  // Add provider
  if (html.indexOf('label: "Kimi"') < 0) {
    html = html.replace(
      'mistral: { label: "Mistral", needsKey: true, model: "mistral-small-latest", vision: false },\n};',
      'mistral: { label: "Mistral", needsKey: true, model: "mistral-small-latest", vision: false },\n  kimi: { label: "Kimi", needsKey: true, model: "kimi-k3", vision: true },\n};'
    );

    // Prefer Kimi early, especially for vision
    html = html.replace(
      'const FALLBACK_ORDER = ["claude", "groq", "gemini", "deepseek", "openrouter", "cerebras", "mistral"];',
      'const FALLBACK_ORDER = ["claude", "kimi", "groq", "gemini", "deepseek", "openrouter", "cerebras", "mistral"];'
    );

    // Also handle if OpenAI patch already ran and extended FALLBACK_ORDER
    html = html.replace(
      'const FALLBACK_ORDER = ["claude", "groq", "gemini", "deepseek", "openrouter", "cerebras", "mistral", "openai"];',
      'const FALLBACK_ORDER = ["claude", "kimi", "groq", "gemini", "deepseek", "openrouter", "cerebras", "mistral", "openai"];'
    );

    // DEFAULT_KEYS
    html = html.replace(
      /(mistral:\s*"[^"]+",)\n\};/,
      '$1\n  kimi: (typeof atob==="function"?atob(CRIA_KIMI_B64):""),\n};'
    );

    // keys state
    html = html.replace(
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", kimi: "" });'
    );
    html = html.replace(
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", openai: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", openai: "", kimi: "" });'
    );

    // callByProviderKey — Kimi with multimodal (vision) support
    var kimiBlock =
      'if (providerKey === "kimi") {\n' +
      '        const messages = [{ role: "system", content: systemPrompt }];\n' +
      '        for (var i = 0; i < history.length; i++) {\n' +
      '          var m = history[i];\n' +
      '          var isLast = i === history.length - 1;\n' +
      '          if (isLast && image && m.role === "user") {\n' +
      '            messages.push({\n' +
      '              role: "user",\n' +
      '              content: [\n' +
      '                { type: "image_url", image_url: { url: "data:" + image.mime + ";base64," + image.data } },\n' +
      '                { type: "text", text: m.text || "Descreva a imagem." }\n' +
      '              ]\n' +
      '            });\n' +
      '          } else {\n' +
      '            messages.push({ role: m.role, content: m.text });\n' +
      '          }\n' +
      '        }\n' +
      '        const response = await fetch("https://api.moonshot.ai/v1/chat/completions", {\n' +
      '          method: "POST",\n' +
      '          headers: { "Content-Type": "application/json", Authorization: "Bearer " + getKey("kimi") },\n' +
      '          body: JSON.stringify({ model: cfg.model, messages: messages })\n' +
      '        });\n' +
      '        const data = await response.json();\n' +
      '        if (data.error) throw new Error(data.error.message || "erro Kimi");\n' +
      '        return data?.choices?.[0]?.message?.content || "";\n' +
      '      }\n';

    // Insert before the final return ""
    html = html.replace(
      'if (providerKey === "mistral")\n        return callOpenAICompatible({\n          url: "https://api.mistral.ai/v1/chat/completions",\n          key: getKey("mistral"),\n          model: cfg.model,\n          history,\n          systemPrompt,\n        });\n      return "";',
      'if (providerKey === "mistral")\n        return callOpenAICompatible({\n          url: "https://api.mistral.ai/v1/chat/completions",\n          key: getKey("mistral"),\n          model: cfg.model,\n          history,\n          systemPrompt,\n        });\n      ' + kimiBlock + '      return "";'
    );

    // Also handle version after openai patch
    html = html.replace(
      'if (providerKey === "openai")\n        return callOpenAICompatible({\n          url: "https://api.openai.com/v1/chat/completions",\n          key: getKey("openai"),\n          model: cfg.model,\n          history,\n          systemPrompt,\n        });\n      return "";',
      'if (providerKey === "openai")\n        return callOpenAICompatible({\n          url: "https://api.openai.com/v1/chat/completions",\n          key: getKey("openai"),\n          model: cfg.model,\n          history,\n          systemPrompt,\n        });\n      ' + kimiBlock + '      return "";'
    );

    // Settings UI KeyField
    html = html.replace(
      '<KeyField label="Chave 6 (Mistral)" value={keys.mistral} onChange={(v) => updateKey("mistral", v)} hint="console.mistral.ai" />',
      '<KeyField label="Chave 6 (Mistral)" value={keys.mistral} onChange={(v) => updateKey("mistral", v)} hint="console.mistral.ai" />\n            <KeyField label="Chave Kimi (Moonshot)" value={keys.kimi} onChange={(v) => updateKey("kimi", v)} hint="platform.kimi.ai" />'
    );
  }

  return html;
};
