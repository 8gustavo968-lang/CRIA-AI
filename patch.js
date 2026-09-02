window.CRIA_PATCH = function(html) {
  try {
    // Multi-mensagens + filtro de recusa da API
    var oldAsk =
      'const text = await callByProviderKey(key, history, systemPrompt, image);\n' +
      '          if (text && text.trim()) return text.trim();';

    var newAsk =
      'const text = await callByProviderKey(key, history, systemPrompt, image);\n' +
      '          if (text && text.trim()) {\n' +
      '            var t = text.trim();\n' +
      '            var low = t.toLowerCase();\n' +
      '            var recusa = /\\bsou ia\\b|não tenho corpo|nao tenho corpo|assistente de ia|não tenho sentimentos|nao tenho sentimentos|não posso (fazer|participar)|nao posso (fazer|participar)|sou um modelo de linguagem|sou uma ia|como ia[, ]|eu sou uma inteligência artificial/i.test(low);\n' +
      '            if (recusa) { lastError = new Error("recusa_modelo"); continue; }\n' +
      '            return t;\n' +
      '          }';

    if (html.indexOf(oldAsk) >= 0) {
      html = html.replace(oldAsk, newAsk);
    } else if (html.indexOf('if (text && text.trim()) return text.trim();') >= 0) {
      html = html.replace(
        'if (text && text.trim()) return text.trim();',
        'if (text && text.trim()) { var t = text.trim(); var low = t.toLowerCase(); if (/\\bsou ia\\b|não tenho corpo|nao tenho corpo|assistente de ia|não tenho sentimentos|nao tenho sentimentos|não posso (fazer|participar)|sou um modelo de linguagem|sou uma ia|eu sou uma inteligência artificial/i.test(low)) { lastError = new Error("recusa_modelo"); continue; } return t; }'
      );
    }

    // multi bolhas
    var oldBlock =
      'const replyText = await askCria(nextMessages, { voice: false, image: image || null });\n' +
      '      const finalMessages = [...nextMessages, { role: "assistant", text: replyText || "Não consegui gerar uma resposta agora. Tenta de novo." }];\n' +
      '      setMessages(finalMessages);\n' +
      '      userTurnCountRef.current += 1;\n' +
      '      if (userTurnCountRef.current % 3 === 0) updateProfile(finalMessages);';

    var newBlock =
      'const replyText = await askCria(nextMessages, { voice: false, image: image || null });\n' +
      '      const parts = (replyText || "Não consegui gerar uma resposta agora. Tenta de novo.").split("|||").map(function(p){return p.trim();}).filter(Boolean);\n' +
      '      var current = nextMessages.slice();\n' +
      '      for (var i = 0; i < parts.length; i++) {\n' +
      '        current = current.concat([{ role: "assistant", text: parts[i] }]);\n' +
      '        setMessages(current);\n' +
      '        if (i < parts.length - 1) await new Promise(function(r){ setTimeout(r, 700 + Math.random()*800); });\n' +
      '      }\n' +
      '      userTurnCountRef.current += 1;\n' +
      '      if (userTurnCountRef.current % 2 === 0) updateProfile(current);';

    if (html.indexOf(oldBlock) >= 0) {
      html = html.replace(oldBlock, newBlock);
    }

    // ordem fallback reforçada
    html = html.replace(
      /const FALLBACK_ORDER = \[[^\]]+\];/,
      'const FALLBACK_ORDER = ["groq", "deepseek", "openrouter", "mistral", "cerebras", "gemini", "openai", "claude"];'
    );
  } catch (e) {
    console.warn('CRIA_PATCH error', e);
  }
  return html;
};
