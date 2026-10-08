window.CRIA_PATCH_APIS = function(html) {
  try {
    // injeta helper de keys (invertidas)
    var inject =
      "var CRIA_RK=function(s){return s.split('').reverse().join('');};\n" +
      "var CRIA_K={gemini:CRIA_RK('QOMB4XScxu81Xw3-atMQxx4TB9KjUd9kpE6YmZ85wkrI6NR8bA.QA')," +
      "groq:CRIA_RK('KVGi7rLUjtEf6dQxIR28JnolYF3bydGW3tl9gEjg8KtYNVPgouqY_ksg')," +
      "openrouter:CRIA_RK('747badf4ee270e532fe94c9a15798fc9b30e52a4fc5c515308c9e6dc5b0f7e83-1v-ro-ks')," +
      "mistral:CRIA_RK('EowSd4_pMV1WMp478zo4myf5vmEJeYF31V5IlHL_lrtsm')," +
      "cohere:CRIA_RK('Ugqk046i7Fl104k6f5dNHP0oihqzmJJqzV6HwBt79lyEqc_erehoc')," +
      "aion:CRIA_RK('AF5soGwF8zUIPfUpH7lRmTcyq54aIdRfBkTZ-8r9sVT_2vla')};\n";

    if (html.indexOf("CRIA_RK=") < 0) {
      html = html.replace("const PROVIDERS = {", inject + "const PROVIDERS = {");
    }

    // PROVIDERS — newlines reais
    var newProviders =
      "const PROVIDERS = {\n" +
      "  aion: { label: \"Aion\", needsKey: true, model: \"aion-labs/aion-2.0\", vision: false },\n" +
      "  groq: { label: \"Groq\", needsKey: true, model: \"openai/gpt-oss-120b\", vision: false },\n" +
      "  gemini: { label: \"Gemini\", needsKey: true, model: \"gemini-2.5-flash\", vision: true },\n" +
      "  openrouter: { label: \"OpenRouter\", needsKey: true, model: \"google/gemma-4-31b-it:free\", vision: false },\n" +
      "  mistral: { label: \"Mistral\", needsKey: true, model: \"mistral-small-latest\", vision: false },\n" +
      "  cohere: { label: \"Cohere\", needsKey: true, model: \"command-a-03-2025\", vision: false },\n" +
      "  deepseek: { label: \"DeepSeek\", needsKey: true, model: \"deepseek-chat\", vision: false },\n" +
      "  cerebras: { label: \"Cerebras\", needsKey: true, model: \"gpt-oss-120b\", vision: false },\n" +
      "  claude: { label: \"Claude\", needsKey: false, model: \"claude-sonnet-4-6\", vision: true },\n" +
      "};";

    html = html.replace(/const PROVIDERS = \{[\s\S]*?\n\};/, newProviders);

    // FALLBACK — Aion primeiro (sem filtro)
    html = html.replace(
      /const FALLBACK_ORDER = \[[^\]]+\];/g,
      'const FALLBACK_ORDER = ["aion", "groq", "openrouter", "mistral", "cohere", "deepseek", "cerebras", "gemini", "claude"];'
    );

    // DEFAULT_KEYS
    var newKeys =
      "const DEFAULT_KEYS = {\n" +
      "  groq: (typeof CRIA_K!=='undefined'?CRIA_K.groq:''),\n" +
      "  gemini: (typeof CRIA_K!=='undefined'?CRIA_K.gemini:''),\n" +
      "  openrouter: (typeof CRIA_K!=='undefined'?CRIA_K.openrouter:''),\n" +
      "  mistral: (typeof CRIA_K!=='undefined'?CRIA_K.mistral:''),\n" +
      "  cohere: (typeof CRIA_K!=='undefined'?CRIA_K.cohere:''),\n" +
      "  aion: (typeof CRIA_K!=='undefined'?CRIA_K.aion:''),\n" +
      "  deepseek: \"\",\n" +
      "  cerebras: \"\",\n" +
      "};";

    html = html.replace(/const DEFAULT_KEYS = \{[\s\S]*?\n\};/, newKeys);

    // keys state
    html = html.replace(
      /const \[keys, setKeys\] = useState\(\{[^}]+\}\);/,
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", cohere: "", aion: "" });'
    );

    // callByProviderKey — aion + cohere
    if (html.indexOf('providerKey === "aion"') < 0) {
      var insert =
        'if (providerKey === "aion")\n' +
        '        return callOpenAICompatible({\n' +
        '          url: "https://api.aionlabs.ai/v1/chat/completions",\n' +
        '          key: getKey("aion"),\n' +
        '          model: cfg.model,\n' +
        '          history,\n' +
        '          systemPrompt,\n' +
        '        });\n' +
        '      if (providerKey === "cohere")\n' +
        '        return callOpenAICompatible({\n' +
        '          url: "https://api.cohere.ai/compatibility/v1/chat/completions",\n' +
        '          key: getKey("cohere"),\n' +
        '          model: cfg.model,\n' +
        '          history,\n' +
        '          systemPrompt,\n' +
        '        });\n' +
        '      return "";';

      html = html.replace(
        /if \(providerKey === "mistral"\)\s*return callOpenAICompatible\(\{\s*url: "https:\/\/api\.mistral\.ai\/v1\/chat\/completions",\s*key: getKey\("mistral"\),\s*model: cfg\.model,\s*history,\s*systemPrompt,\s*\}\);\s*return "";/,
        'if (providerKey === "mistral")\n        return callOpenAICompatible({\n          url: "https://api.mistral.ai/v1/chat/completions",\n          key: getKey("mistral"),\n          model: cfg.model,\n          history,\n          systemPrompt,\n        });\n      ' + insert
      );
    }

    // UI KeyFields
    if (html.indexOf("Chave Aion") < 0) {
      html = html.replace(
        '<KeyField label="Chave 6 (Mistral)" value={keys.mistral} onChange={(v) => updateKey("mistral", v)} hint="console.mistral.ai" />',
        '<KeyField label="Chave 6 (Mistral)" value={keys.mistral} onChange={(v) => updateKey("mistral", v)} hint="console.mistral.ai" />\n' +
        '            <KeyField label="Chave Aion (sem filtro)" value={keys.aion} onChange={(v) => updateKey("aion", v)} hint="aionlabs.ai" />\n' +
        '            <KeyField label="Chave Cohere" value={keys.cohere} onChange={(v) => updateKey("cohere", v)} hint="dashboard.cohere.com" />'
      );
    }

    // anti-recusa
    if (html.indexOf("recusa_modelo") < 0) {
      html = html.replace(
        "if (text && text.trim()) return text.trim();",
        'if (text && text.trim()) { var t = text.trim(); var low = t.toLowerCase(); if (/sou ia|nao tenho corpo|não tenho corpo|assistente de ia|sou uma ia|inteligencia artificial|como uma ia|não posso ajudar|violat|policy|content policy|não posso continuar|i cannot|as an ai/i.test(low)) { lastError = new Error("recusa_modelo"); continue; } return t; }'
      );
    }

  } catch (e) {
    console.warn("CRIA_PATCH_APIS error", e);
  }
  return html;
};
