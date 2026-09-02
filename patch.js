window.CRIA_PATCH = function(html) {
  try {
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
  } catch (e) {
    console.warn('CRIA_PATCH error', e);
  }
  return html;
};
