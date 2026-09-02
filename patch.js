window.CRIA_PATCH = function(html) {
  try {
    // FIX CRITICO: _file usado sem declarar (ReferenceError = nao responde)
    if (html.indexOf('if (_file &&') >= 0 && html.indexOf('var _file = pendingFile') < 0 && html.indexOf('var _file=pendingFile') < 0) {
      html = html.replace(
        'var _imgArg = image || null;',
        'var _file = (typeof pendingFile !== "undefined" ? pendingFile : null);\n    var _imgArg = image || null;'
      );
      html = html.replace(
        'var _imgArg = image || null;',
        'var _file = (typeof pendingFile !== "undefined" ? pendingFile : null);\n    var _imgArg = image || null;'
      );
    }
    // se ainda sobrou _file sem decl no sendMessage, forca no inicio da funcao
    if (html.indexOf('_file &&') >= 0 && html.indexOf('var _file') < 0) {
      html = html.replace(
        /async function sendMessage\(([^)]*)\) \{/,
        'async function sendMessage($1) {\n    var _file = (typeof pendingFile !== "undefined" ? pendingFile : null);'
      );
    }

    // anti-recusa no loop de providers
    if (html.indexOf('recusa_modelo') < 0) {
      html = html.replace(
        'if (text && text.trim()) return text.trim();',
        'if (text && text.trim()) { var t = text.trim(); var low = t.toLowerCase(); if (/\\bsou ia\\b|não tenho corpo|nao tenho corpo|assistente de ia|não tenho sentimentos|nao tenho sentimentos|sou um modelo de linguagem|sou uma ia|eu sou uma inteligência artificial/i.test(low)) { lastError = new Error("recusa_modelo"); continue; } return t; }'
      );
    }

    // multi bolhas - varios padroes de sendMessage
    if (html.indexOf('split("|||")') < 0) {
      // padrao pos chat-plus
      var a =
        'const replyText = await askCria(nextMessages, { voice: false, image: (typeof _imgArg !== "undefined" ? _imgArg : (image || null)) });\n' +
        '      const finalMessages = [...nextMessages, { role: "assistant", text: replyText || "Não consegui gerar uma resposta agora. Tenta de novo." }];\n' +
        '      setMessages(finalMessages);';
      var b =
        'const replyText = await askCria(nextMessages, { voice: false, image: (typeof _imgArg !== "undefined" ? _imgArg : (image || null)) });\n' +
        '      const parts = (replyText || "Não consegui gerar uma resposta agora. Tenta de novo.").split("|||").map(function(p){return p.trim();}).filter(Boolean);\n' +
        '      var current = nextMessages.slice();\n' +
        '      for (var i = 0; i < parts.length; i++) {\n' +
        '        current = current.concat([{ role: "assistant", text: parts[i] }]);\n' +
        '        setMessages(current);\n' +
        '        if (i < parts.length - 1) await new Promise(function(r){ setTimeout(r, 700 + Math.random()*800); });\n' +
        '      }\n' +
        '      var finalMessages = current;';
      if (html.indexOf(a) >= 0) html = html.replace(a, b);

      var a2 =
        'const replyText = await askCria(nextMessages, { voice: false, image: image || null });\n' +
        '      const finalMessages = [...nextMessages, { role: "assistant", text: replyText || "Não consegui gerar uma resposta agora. Tenta de novo." }];\n' +
        '      setMessages(finalMessages);';
      var b2 =
        'const replyText = await askCria(nextMessages, { voice: false, image: image || null });\n' +
        '      const parts = (replyText || "Não consegui gerar uma resposta agora. Tenta de novo.").split("|||").map(function(p){return p.trim();}).filter(Boolean);\n' +
        '      var current = nextMessages.slice();\n' +
        '      for (var i = 0; i < parts.length; i++) {\n' +
        '        current = current.concat([{ role: "assistant", text: parts[i] }]);\n' +
        '        setMessages(current);\n' +
        '        if (i < parts.length - 1) await new Promise(function(r){ setTimeout(r, 700 + Math.random()*800); });\n' +
        '      }\n' +
        '      var finalMessages = current;';
      if (html.indexOf(a2) >= 0) html = html.replace(a2, b2);
    }

    // FALLBACK por ultimo: modelos menos censurados primeiro, sem cohere (nao existe no PROVIDERS)
    html = html.replace(
      /const FALLBACK_ORDER = \[[^\]]+\];/g,
      'const FALLBACK_ORDER = ["groq", "deepseek", "openrouter", "mistral", "cerebras", "gemini", "openai", "claude"];'
    );

    // protege o loop: se PROVIDERS[key] undefined, pula
    html = html.replace(
      'const cfg = PROVIDERS[key];\n        if (cfg.needsKey && !getKey(key)) continue;',
      'const cfg = PROVIDERS[key];\n        if (!cfg) continue;\n        if (cfg.needsKey && !getKey(key)) continue;'
    );
  } catch (e) {
    console.warn('CRIA_PATCH error', e);
  }
  return html;
};
