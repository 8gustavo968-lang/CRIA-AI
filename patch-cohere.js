window.CRIA_PATCH_COHERE = function(html) {
  if (html.indexOf('label: "Cohere"') >= 0 && html.indexOf('CRIA_COHERE_B64') >= 0) return html;

  var b64line = 'var CRIA_COHERE_B64="Vks4Z2FPYlp1VGRPYmxlb2xua1IwdGxJSWpJeVRTTXBLMmFoRmNRSg==";\n';

  if (html.indexOf('CRIA_COHERE_B64') < 0) {
    html = html.replace(
      'const PROVIDERS = {',
      b64line + 'const PROVIDERS = {'
    );
  }

  if (html.indexOf('label: "Cohere"') < 0) {
    // Provider entry
    html = html.replace(
      'mistral: { label: "Mistral", needsKey: true, model: "mistral-small-latest", vision: false },\n};',
      'mistral: { label: "Mistral", needsKey: true, model: "mistral-small-latest", vision: false },\n  cohere: { label: "Cohere", needsKey: true, model: "command-a-03-2025", vision: false },\n};'
    );
    html = html.replace(
      'sambanova: { label: "SambaNova", needsKey: true, model: "Meta-Llama-3.3-70B-Instruct", vision: false },\n};',
      'sambanova: { label: "SambaNova", needsKey: true, model: "Meta-Llama-3.3-70B-Instruct", vision: false },\n  cohere: { label: "Cohere", needsKey: true, model: "command-a-03-2025", vision: false },\n};'
    );
    html = html.replace(
      'kimi: { label: "Kimi", needsKey: true, model: "kimi-k3", vision: true },\n};',
      'kimi: { label: "Kimi", needsKey: true, model: "kimi-k3", vision: true },\n  cohere: { label: "Cohere", needsKey: true, model: "command-a-03-2025", vision: false },\n};'
    );

    // FALLBACK_ORDER
    html = html.replace(
      /const FALLBACK_ORDER = \[([\s\S]*?)\];/,
      function(m, inner) {
        if (inner.indexOf('"cohere"') >= 0) return m;
        // insert after sambanova or kimi or claude
        if (inner.indexOf('"sambanova"') >= 0) {
          return 'const FALLBACK_ORDER = [' + inner.replace('"sambanova"', '"sambanova", "cohere"') + '];';
        }
        if (inner.indexOf('"kimi"') >= 0) {
          return 'const FALLBACK_ORDER = [' + inner.replace('"kimi"', '"kimi", "cohere"') + '];';
        }
        return 'const FALLBACK_ORDER = ["claude", "cohere", ' + inner.replace(/^\[/, '').replace(/^\s*/, '') + '];';
      }
    );

    // DEFAULT_KEYS
    html = html.replace(
      /(mistral:\s*"[^"]+",)\n\};/,
      '$1\n  cohere: (typeof atob==="function"?atob(CRIA_COHERE_B64):""),\n};'
    );
    html = html.replace(
      /(sambanova:\s*\(typeof atob==="function"\?atob\(CRIA_SAMBA_B64\):""\),)\n\};/,
      '$1\n  cohere: (typeof atob==="function"?atob(CRIA_COHERE_B64):""),\n};'
    );
    html = html.replace(
      /(kimi:\s*\(typeof atob==="function"\?atob\(CRIA_KIMI_B64\):""\),)\n\};/,
      '$1\n  cohere: (typeof atob==="function"?atob(CRIA_COHERE_B64):""),\n};'
    );

    // keys state — several possible shapes after previous patches
    var keyStates = [
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", openai: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", kimi: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", openai: "", kimi: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", openai: "", kimi: "", sambanova: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", kimi: "", sambanova: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", sambanova: "" });'
    ];
    keyStates.forEach(function(old) {
      if (old.indexOf('cohere') < 0) {
        var neu = old.replace(' });', ', cohere: "" });');
        html = html.replace(old, neu);
      }
    });

    // callByProviderKey
    var cohereBlock =
      'if (providerKey === "cohere")\n' +
      '        return callOpenAICompatible({\n' +
      '          url: "https://api.cohere.ai/compatibility/v1/chat/completions",\n' +
      '          key: getKey("cohere"),\n' +
      '          model: cfg.model,\n' +
      '          history,\n' +
      '          systemPrompt,\n' +
      '        });\n';

    html = html.replace(
      'if (providerKey === "mistral")\n        return callOpenAICompatible({\n          url: "https://api.mistral.ai/v1/chat/completions",\n          key: getKey("mistral"),\n          model: cfg.model,\n          history,\n          systemPrompt,\n        });\n      return "";',
      'if (providerKey === "mistral")\n        return callOpenAICompatible({\n          url: "https://api.mistral.ai/v1/chat/completions",\n          key: getKey("mistral"),\n          model: cfg.model,\n          history,\n          systemPrompt,\n        });\n      ' + cohereBlock + '      return "";'
    );

    // catch versions that already have sambanova / kimi blocks before return
    html = html.replace(
      /(if \(providerKey === "sambanova"\)[\s\S]*?systemPrompt,\n\s*\}\);\n)/,
      '$1      ' + cohereBlock
    );

    // KeyField
    html = html.replace(
      '<KeyField label="Chave 6 (Mistral)" value={keys.mistral} onChange={(v) => updateKey("mistral", v)} hint="console.mistral.ai" />',
      '<KeyField label="Chave 6 (Mistral)" value={keys.mistral} onChange={(v) => updateKey("mistral", v)} hint="console.mistral.ai" />\n            <KeyField label="Chave Cohere" value={keys.cohere} onChange={(v) => updateKey("cohere", v)} hint="dashboard.cohere.com" />'
    );
    html = html.replace(
      '<KeyField label="Chave SambaNova" value={keys.sambanova} onChange={(v) => updateKey("sambanova", v)} hint="cloud.sambanova.ai" />',
      '<KeyField label="Chave SambaNova" value={keys.sambanova} onChange={(v) => updateKey("sambanova", v)} hint="cloud.sambanova.ai" />\n            <KeyField label="Chave Cohere" value={keys.cohere} onChange={(v) => updateKey("cohere", v)} hint="dashboard.cohere.com" />'
    );
    html = html.replace(
      '<KeyField label="Chave Kimi (Moonshot)" value={keys.kimi} onChange={(v) => updateKey("kimi", v)} hint="platform.kimi.ai" />',
      '<KeyField label="Chave Kimi (Moonshot)" value={keys.kimi} onChange={(v) => updateKey("kimi", v)} hint="platform.kimi.ai" />\n            <KeyField label="Chave Cohere" value={keys.cohere} onChange={(v) => updateKey("cohere", v)} hint="dashboard.cohere.com" />'
    );
  }

  return html;
};
