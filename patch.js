window.CRIA_PATCH = function(html) {
  try {
    if (html.indexOf('recusa_modelo') < 0) {
      html = html.replace(
        'if (text && text.trim()) return text.trim();',
        'if (text && text.trim()) { var t = text.trim(); var low = t.toLowerCase(); if (/sou ia|nao tenho corpo|não tenho corpo|assistente de ia|sou uma ia|inteligencia artificial|como uma ia|não posso|content policy|as an ai|i cannot/i.test(low)) { lastError = new Error("recusa_modelo"); continue; } return t; }'
      );
    }

    if (html.indexOf('split("|||")') < 0) {
      html = html.replace(
        /const replyText = await askCria\((nextMessages|_hist), \{ voice: false, image: ([^}]+)\}\);\s*const finalMessages = \[\.\.\.nextMessages, \{ role: "assistant", text: replyText \|\| "[^"]*" \}\];\s*setMessages\(finalMessages\);/g,
        'const replyText = await askCria($1, { voice: false, image: $2});\n' +
        '      const parts = (replyText || "ops").split("|||").map(function(p){return p.trim();}).filter(Boolean);\n' +
        '      var current = nextMessages.slice();\n' +
        '      for (var i = 0; i < parts.length; i++) {\n' +
        '        current = current.concat([{ role: "assistant", text: parts[i] }]);\n' +
        '        setMessages(current);\n' +
        '        if (i < parts.length - 1) await new Promise(function(r){ setTimeout(r, 400 + Math.random()*500); });\n' +
        '      }\n' +
        '      var finalMessages = current;\n' +
        '      setMessages(finalMessages);'
      );
    } else {
      html = html.replace(/600 \+ Math\.random\(\)\*700/g, '400 + Math.random()*500');
    }

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
