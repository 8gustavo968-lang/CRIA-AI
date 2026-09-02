window.CRIA_PATCH = function(html) {
  try {
    // ===== FIX CRITICO: _file sem declarar = ReferenceError = nao responde =====
    if (html.indexOf('_file') >= 0 && html.indexOf('var _file') < 0) {
      html = html.replace(
        'var _imgArg = image || null;',
        'var _file = (typeof pendingFile !== "undefined" ? pendingFile : null);\n    var _imgArg = image || null;'
      );
    }
    if (html.indexOf('_file') >= 0 && html.indexOf('var _file') < 0) {
      html = html.replace(
        /async function sendMessage\(([^)]*)\) \{/,
        'async function sendMessage($1) {\n    var _file = (typeof pendingFile !== "undefined" ? pendingFile : null);'
      );
    }

    // anti-recusa
    if (html.indexOf('recusa_modelo') < 0) {
      html = html.replace(
        'if (text && text.trim()) return text.trim();',
        'if (text && text.trim()) { var t = text.trim(); var low = t.toLowerCase(); if (/sou ia|nao tenho corpo|não tenho corpo|assistente de ia|sou uma ia|inteligencia artificial/i.test(low)) { lastError = new Error("recusa_modelo"); continue; } return t; }'
      );
    }

    // multi bolhas
    if (html.indexOf('split("|||")') < 0) {
      html = html.replace(
        /const replyText = await askCria\(nextMessages, \{ voice: false, image: \(typeof _imgArg !== "undefined" \? _imgArg : \(image \|\| null\)\) \}\);\s*const finalMessages = \[\.\.\.nextMessages, \{ role: "assistant", text: replyText[^\]]+\]\];\s*setMessages\(finalMessages\);/,
        'const replyText = await askCria(nextMessages, { voice: false, image: (typeof _imgArg !== "undefined" ? _imgArg : (image || null)) });\n      const parts = (replyText || "ops").split("|||").map(function(p){return p.trim();}).filter(Boolean);\n      var current = nextMessages.slice();\n      for (var i = 0; i < parts.length; i++) {\n        current = current.concat([{ role: "assistant", text: parts[i] }]);\n        setMessages(current);\n        if (i < parts.length - 1) await new Promise(function(r){ setTimeout(r, 600 + Math.random()*700); });\n      }\n      var finalMessages = current;'
      );
      html = html.replace(
        /const replyText = await askCria\(nextMessages, \{ voice: false, image: image \|\| null \}\);\s*const finalMessages = \[\.\.\.nextMessages, \{ role: "assistant", text: replyText[^\]]+\]\];\s*setMessages\(finalMessages\);/,
        'const replyText = await askCria(nextMessages, { voice: false, image: image || null });\n      const parts = (replyText || "ops").split("|||").map(function(p){return p.trim();}).filter(Boolean);\n      var current = nextMessages.slice();\n      for (var i = 0; i < parts.length; i++) {\n        current = current.concat([{ role: "assistant", text: parts[i] }]);\n        setMessages(current);\n        if (i < parts.length - 1) await new Promise(function(r){ setTimeout(r, 600 + Math.random()*700); });\n      }\n      var finalMessages = current;'
      );
    }

    // FALLBACK final (sem cohere fantasma)
    html = html.replace(
      /const FALLBACK_ORDER = \[[^\]]+\];/g,
      'const FALLBACK_ORDER = ["groq", "deepseek", "openrouter", "mistral", "cerebras", "gemini", "openai", "claude"];'
    );

    // protege PROVIDERS undefined
    if (html.indexOf('if (!cfg) continue') < 0) {
      html = html.replace(
        'const cfg = PROVIDERS[key];\n        if (cfg.needsKey && !getKey(key)) continue;',
        'const cfg = PROVIDERS[key];\n        if (!cfg) continue;\n        if (cfg.needsKey && !getKey(key)) continue;'
      );
    }
  } catch (e) {
    console.warn('CRIA_PATCH error', e);
  }
  return html;
};
