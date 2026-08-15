window.CRIA_PATCH = function(html) {
  if (html.indexOf('msgActions') >= 0 && html.indexOf('splitReply') >= 0) return html;

  // --- Multi-message support ---
  // Substitui o trecho que adiciona a resposta única por um que divide por ||| e envia com delay
  html = html.replace(
    "const replyText = await askCria(nextMessages, { voice: false, image: image || null });\n      const finalMessages = [...nextMessages, { role: \"assistant\", text: replyText || \"Não consegui gerar uma resposta agora. Tenta de novo.\" }];\n      setMessages(finalMessages);\n      userTurnCountRef.current += 1;\n      if (userTurnCountRef.current % 3 === 0) updateProfile(finalMessages);",
    "const replyText = await askCria(nextMessages, { voice: false, image: image || null });\n      const parts = (replyText || \"Não consegui gerar uma resposta agora. Tenta de novo.\").split(\"|||\").map(p => p.trim()).filter(Boolean);\n      let current = [...nextMessages];\n      for (let i = 0; i < parts.length; i++) {\n        current = [...current, { role: \"assistant\", text: parts[i] }];\n        setMessages(current);\n        if (i < parts.length - 1) await new Promise(r => setTimeout(r, 600 + Math.random() * 500));\n      }\n      userTurnCountRef.current += 1;\n      if (userTurnCountRef.current % 3 === 0) updateProfile(current);"
  );

  // Também no resendFromEdit (se existir)
  html = html.replace(
    "const replyText = await askCria(nextMessages, { voice: false, image: null });\n      setMessages([...nextMessages, { role: \"assistant\", text: replyText || \"Nao consegui gerar uma resposta agora.\" }]);",
    "const replyText = await askCria(nextMessages, { voice: false, image: null });\n      const parts = (replyText || \"Nao consegui gerar uma resposta agora.\").split(\"|||\").map(p => p.trim()).filter(Boolean);\n      let current = [...nextMessages];\n      for (let i = 0; i < parts.length; i++) {\n        current = [...current, { role: \"assistant\", text: parts[i] }];\n        setMessages(current);\n        if (i < parts.length - 1) await new Promise(r => setTimeout(r, 600 + Math.random() * 500));\n      }"
  );

  // --- Rest of original patch (msgActions, edit, attach, etc.) ---
  html = html.replace(
    "async function sendMessage(image) {\n    const text = input.trim();\n    if (!text || loading) return;\n\n    const nextMessages = [...messages, { role: \"user\", text }];",
    "async function resendFromEdit(editIndex, newText) {\n    if (!newText.trim() || loading) return;\n    const truncated = messages.slice(0, editIndex);\n    const nextMessages = [...truncated, { role: \"user\", text: newText.trim() }];\n    setMessages(nextMessages);\n    setLoading(true);\n    try {\n      const replyText = await askCria(nextMessages, { voice: false, image: null });\n      const parts = (replyText || \"Nao consegui gerar uma resposta agora.\").split(\"|||\").map(p => p.trim()).filter(Boolean);\n      let current = [...nextMessages];\n      for (let i = 0; i < parts.length; i++) {\n        current = [...current, { role: \"assistant\", text: parts[i] }];\n        setMessages(current);\n        if (i < parts.length - 1) await new Promise(r => setTimeout(r, 600 + Math.random() * 500));\n      }\n    } catch (err) {\n      setMessages((prev) => [...prev, { role: \"assistant\", text: \"Deu um problema. Tenta de novo.\" }]);\n    } finally { setLoading(false); }\n  }\n  async function sendMessage(image, overrideText) {\n    const text = (overrideText !== undefined ? overrideText : input).trim();\n    if ((!text && !image) || loading) return;\n    const displayText = text || (image ? \"[imagem]\" : \"\");\n    const nextMessages = [...messages, { role: \"user\", text: displayText }];"
  );

  html = html.replace(
    "const replyText = await askCria(nextMessages, { voice: false, image: image || null });",
    "const historyForApi = text ? nextMessages : [...messages, { role: \"user\", text: \"Analise esta imagem e descreva o que voce ve.\" }];\n      const replyText = await askCria(historyForApi, { voice: false, image: image || null });"
  );

  html = html.replace(
    "onSend={sendMessage} scrollRef={scrollRef}",
    "onSend={sendMessage} onResend={resendFromEdit} scrollRef={scrollRef}"
  );

  html = html.replace(
    "bubbleAssistant: { background: \"#1A1F2E\", color: \"#EDEFF5\", borderBottomLeftRadius: \"4px\" },",
    "bubbleAssistant: { background: \"#1A1F2E\", color: \"#EDEFF5\", borderBottomLeftRadius: \"4px\" },\n  msgActions: { display: \"flex\", gap: \"6px\", marginTop: \"6px\", flexWrap: \"wrap\" },\n  msgActionBtn: { background: \"transparent\", border: \"none\", color: \"#9AA3B8\", fontSize: \"12px\", padding: \"2px 6px\", cursor: \"pointer\" },\n  attachPreview: { display: \"flex\", alignItems: \"center\", gap: \"10px\", padding: \"8px 0\" },\n  attachImg: { width: \"56px\", height: \"56px\", objectFit: \"cover\", borderRadius: \"10px\" },\n  toast: { fontSize: \"12px\", color: \"#F2B705\", textAlign: \"center\" },"
  );

  var oldMap = "{messages.map((m, i) => (\n          <div key={i} style={{ ...styles.bubbleRow, justifyContent: m.role === \"user\" ? \"flex-end\" : \"flex-start\" }}>\n            <div style={{ ...styles.bubble, ...(m.role === \"user\" ? styles.bubbleUser : styles.bubbleAssistant) }}>{m.text}</div>\n          </div>\n        ))}";
  var newMap = "{messages.map((m, i) => (\n          <div key={i} id={\"msg-\"+i} style={{ ...styles.bubbleRow, justifyContent: m.role === \"user\" ? \"flex-end\" : \"flex-start\", flexDirection: \"column\", alignItems: m.role === \"user\" ? \"flex-end\" : \"flex-start\" }}>\n            <div style={{ ...styles.bubble, ...(m.role === \"user\" ? styles.bubbleUser : styles.bubbleAssistant) }}>{m.text}</div>\n            <div style={styles.msgActions}>\n              <button type=\"button\" style={styles.msgActionBtn} onClick={() => { try { navigator.clipboard.writeText(m.text); } catch(e){} }}>Copiar</button>\n              <button type=\"button\" style={styles.msgActionBtn} onClick={() => { const u = location.href.split(\"#\")[0]+\"#msg-\"+i; if(navigator.share){ navigator.share({text:m.text,url:u}).catch(()=>{}); } else { try{navigator.clipboard.writeText(u);}catch(e){} } }}>Link</button>\n              {m.role === \"user\" && <button type=\"button\" style={styles.msgActionBtn} onClick={() => { const t = prompt(\"Editar mensagem:\", m.text); if(t && t.trim() && onResend) onResend(i, t.trim()); }}>Editar</button>}\n              {m.role === \"assistant\" && <button type=\"button\" style={styles.msgActionBtn} onClick={() => { if(!window.speechSynthesis) return; window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(m.text); u.lang=\"pt-BR\"; window.speechSynthesis.speak(u); }}>Ouvir</button>}\n            </div>\n          </div>\n        ))}";
  if (html.indexOf(oldMap) >= 0) html = html.replace(oldMap, newMap);

  var oldScreenBtn = "<button\n          type=\"button\"\n          onClick={() => (screen.sharing ? screen.stop() : screen.start())}\n          style={{ ...styles.screenBtn, ...(screen.sharing ? styles.screenBtnActive : {}) }}\n          aria-label=\"Compartilhar tela\"";
  var fileBtn = "<input type=\"file\" accept=\"image/*,.txt,.md,.json,.csv\" style={{display:\"none\"}} ref={fileRef} onChange={(e)=>{ const f=e.target.files&&e.target.files[0]; if(!f) return; const r=new FileReader(); if(f.type.startsWith(\"image/\")){ r.onload=()=>{ const d=String(r.result||\"\"); setAttachment({kind:\"image\",mime:f.type,data:d.split(\",\")[1],name:f.name,preview:d}); }; r.readAsDataURL(f); } else { r.onload=()=>setAttachment({kind:\"file\",name:f.name,text:String(r.result||\"\")}); r.readAsText(f);} }} />\n        <button type=\"button\" onClick={() => fileRef.current && fileRef.current.click()} style={styles.screenBtn} aria-label=\"Enviar foto ou arquivo\" title=\"Foto ou arquivo\">+</button>\n        <button\n          type=\"button\"\n          onClick={() => (screen.sharing ? screen.stop() : screen.start())}\n          style={{ ...styles.screenBtn, ...(screen.sharing ? styles.screenBtnActive : {}) }}\n          aria-label=\"Compartilhar tela\"";
  if (html.indexOf(oldScreenBtn) >= 0) html = html.replace(oldScreenBtn, fileBtn);

  html = html.replace(
    "function ChatView({ messages, loading, input, setInput, onSend, scrollRef }) {\n  const screen = useScreenShare();",
    "function ChatView({ messages, loading, input, setInput, onSend, onResend, scrollRef }) {\n  const screen = useScreenShare();\n  const fileRef = useRef(null);\n  const [attachment, setAttachment] = useState(null);"
  );

  html = html.replace(
    "async function handleSubmit(e) {\n    e.preventDefault();\n    onSend(screen.sharing ? await screen.captureFrame() : null);\n  }",
    "async function handleSubmit(e) {\n    e.preventDefault();\n    let image = null;\n    if (attachment && attachment.kind === \"image\") image = { mime: attachment.mime, data: attachment.data };\n    if (screen.sharing) image = await screen.captureFrame();\n    let textToSend = input;\n    if (attachment && attachment.kind === \"file\") {\n      var nl = String.fromCharCode(10);\n      textToSend = (input.trim() ? input.trim() + nl + nl : \"\") + \"[Arquivo: \" + attachment.name + \"]\" + nl + (attachment.text || \"\").slice(0, 8000);\n    }\n    setAttachment(null);\n    if (fileRef.current) fileRef.current.value = \"\";\n    onSend(image, textToSend);\n  }"
  );

  html = html.replace(
    "{screen.error && <p style={styles.errorText}>{screen.error}</p>}",
    "{screen.error && <p style={styles.errorText}>{screen.error}</p>}\n      {attachment && (\n        <div style={styles.attachPreview}>\n          {attachment.kind === \"image\" && attachment.preview ? <img src={attachment.preview} alt=\"\" style={styles.attachImg} /> : <span>{attachment.name}</span>}\n          <button type=\"button\" style={styles.msgActionBtn} onClick={() => { setAttachment(null); if(fileRef.current) fileRef.current.value=\"\"; }}>Remover</button>\n        </div>\n      )}"
  );

  html = html.replace(
    "disabled={loading || !input.trim()}",
    "disabled={loading || (!input.trim() && !attachment && !screen.sharing)}"
  );

  return html;
};
