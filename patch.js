window.CRIA_PATCH = function(html) {
  if (html.indexOf('splitReplyParts') >= 0) return html;

  var oldReplyBlock =
    'const replyText = await askCria(nextMessages, { voice: false, image: image || null });\n' +
    '      const finalMessages = [...nextMessages, { role: "assistant", text: replyText || "Não consegui gerar uma resposta agora. Tenta de novo." }];\n' +
    '      setMessages(finalMessages);\n' +
    '      userTurnCountRef.current += 1;\n' +
    '      if (userTurnCountRef.current % 3 === 0) updateProfile(finalMessages);';

  var newReplyBlock =
    'const replyText = await askCria(nextMessages, { voice: false, image: image || null });\n' +
    '      const parts = (replyText || "Não consegui gerar uma resposta agora. Tenta de novo.").split("|||").map(function(p){return p.trim();}).filter(Boolean);\n' +
    '      var current = nextMessages.slice();\n' +
    '      for (var i = 0; i < parts.length; i++) {\n' +
    '        current = current.concat([{ role: "assistant", text: parts[i] }]);\n' +
    '        setMessages(current);\n' +
    '        if (i < parts.length - 1) await new Promise(function(r){ setTimeout(r, 550 + Math.random()*450); });\n' +
    '      }\n' +
    '      userTurnCountRef.current += 1;\n' +
    '      if (userTurnCountRef.current % 3 === 0) updateProfile(current);';

  if (html.indexOf(oldReplyBlock) >= 0) {
    html = html.replace(oldReplyBlock, newReplyBlock);
  } else {
    html = html.replace(
      /const replyText = await askCria\(nextMessages, \{ voice: false, image: image \|\| null \}\);\s*const finalMessages = \[\.\.\.nextMessages, \{ role: "assistant", text: replyText \|\| "[^"]*" \}\];\s*setMessages\(finalMessages\);\s*userTurnCountRef\.current \+= 1;\s*if \(userTurnCountRef\.current % 3 === 0\) updateProfile\(finalMessages\);/,
      newReplyBlock
    );
  }

  if (html.indexOf('msgActions') < 0) {
    html = html.replace(
      "async function sendMessage(image) {\n    const text = input.trim();\n    if (!text || loading) return;\n\n    const nextMessages = [...messages, { role: \"user\", text }];",
      "async function resendFromEdit(editIndex, newText) {\n    if (!newText.trim() || loading) return;\n    const truncated = messages.slice(0, editIndex);\n    const nextMessages = [...truncated, { role: \"user\", text: newText.trim() }];\n    setMessages(nextMessages);\n    setLoading(true);\n    try {\n      const replyText = await askCria(nextMessages, { voice: false, image: null });\n      const parts = (replyText || \"Nao consegui gerar uma resposta agora.\").split(\"|||\").map(function(p){return p.trim();}).filter(Boolean);\n      var current = nextMessages.slice();\n      for (var i = 0; i < parts.length; i++) {\n        current = current.concat([{ role: \"assistant\", text: parts[i] }]);\n        setMessages(current);\n        if (i < parts.length - 1) await new Promise(function(r){ setTimeout(r, 550 + Math.random()*450); });\n      }\n    } catch (err) {\n      setMessages((prev) => [...prev, { role: \"assistant\", text: \"Deu um problema. Tenta de novo.\" }]);\n    } finally { setLoading(false); }\n  }\n  async function sendMessage(image, overrideText) {\n    const text = (overrideText !== undefined ? overrideText : input).trim();\n    if ((!text && !image) || loading) return;\n    const displayText = text || (image ? \"[imagem]\" : \"\");\n    const nextMessages = [...messages, { role: \"user\", text: displayText }];"
    );

    html = html.replace(
      "onSend={sendMessage} scrollRef={scrollRef}",
      "onSend={sendMessage} onResend={resendFromEdit} scrollRef={scrollRef}"
    );

    html = html.replace(
      "bubbleAssistant: { background: \"#1A1F2E\", color: \"#EDEFF5\", borderBottomLeftRadius: \"4px\" },",
      "bubbleAssistant: { background: \"#1A1F2E\", color: \"#EDEFF5\", borderBottomLeftRadius: \"4px\" },\n  msgActions: { display: \"flex\", gap: \"6px\", marginTop: \"6px\", flexWrap: \"wrap\" },\n  msgActionBtn: { background: \"transparent\", border: \"none\", color: \"#9AA3B8\", fontSize: \"12px\", padding: \"2px 6px\", cursor: \"pointer\" },\n  attachPreview: { display: \"flex\", alignItems: \"center\", gap: \"10px\", padding: \"8px 0\" },\n  attachImg: { width: \"56px\", height: \"56px\", objectFit: \"cover\", borderRadius: \"10px\" },"
    );
  }

  html = html.replace("function Cria()", "/* splitReplyParts */\nfunction Cria()");

  return html;
};
