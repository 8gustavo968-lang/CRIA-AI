window.CRIA_PATCH_CHATPLUS = function(html) {
  try {
    if (html.indexOf('CRIA_CHATPLUS_V137') >= 0) return html;

    html = html.replace(
      'const [input, setInput] = useState("");\n  const [loading, setLoading] = useState(false);',
      'const [input, setInput] = useState("");\n  const [loading, setLoading] = useState(false);\n' +
      '  /* CRIA_CHATPLUS_V137 */\n' +
      '  const [criaPendingFile, setCriaPendingFile] = useState(null);\n' +
      '  const criaFileRef = useRef(null);\n' +
      '  function criaNewChat(){ if (loading) return; setMessages([{ role: "assistant", text: "chat novo|||pode mandar texto, foto ou arquivo" }]); setInput(""); setCriaPendingFile(null); }\n' +
      '  function criaReadAnyFile(file){\n' +
      '    return new Promise(function(resolve, reject){\n' +
      '      if (!file) return reject(new Error("sem arquivo"));\n' +
      '      var name = file.name || "arquivo", mime = file.type || "application/octet-stream", size = file.size || 0;\n' +
      '      var isImg = /^image\\//i.test(mime) || /\\.(png|jpe?g|gif|webp|bmp)$/i.test(name);\n' +
      '      var isText = /^text\\//i.test(mime) || /\\.(txt|md|json|csv|js|ts|py|html?|css|xml|log|yml|yaml|sh)$/i.test(name);\n' +
      '      if (isImg) {\n' +
      '        if (size > 4*1024*1024) return reject(new Error("max 4MB"));\n' +
      '        var r = new FileReader(); r.onload = function(){ var d=String(r.result||""); var m=d.match(/^data:([^;]+);base64,(.+)$/); if(!m) return reject(new Error("falha")); resolve({kind:"image",name:name,mime:m[1],data:m[2],size:size}); }; r.onerror=function(){reject(new Error("erro"));}; r.readAsDataURL(file); return;\n' +
      '      }\n' +
      '      var rt = new FileReader(); rt.onload = function(){ var txt=String(rt.result||""); if(txt.length>200000) txt=txt.slice(0,200000)+"\\n\u2026"; resolve({kind:isText?"text":"binary",name:name,mime:mime,size:size,text:txt}); }; rt.onerror=function(){reject(new Error("erro"));}; rt.readAsText(file);\n' +
      '    });\n' +
      '  }\n' +
      '  async function criaOnFilePicked(e){ var f=e.target.files&&e.target.files[0]; e.target.value=""; if(!f) return; try{ setCriaPendingFile(await criaReadAnyFile(f)); }catch(err){ setMessages(function(p){return p.concat([{role:"assistant",text:"nao li: "+(err.message||err)}]);}); } }\n'
    );

    html = html.replace(
      'scrollRef={scrollRef} voiceGender={voiceGender} elevenKey={elevenKey} elevenVoiceId={elevenVoiceId} />',
      'scrollRef={scrollRef} voiceGender={voiceGender} elevenKey={elevenKey} elevenVoiceId={elevenVoiceId} criaPendingFile={criaPendingFile} setCriaPendingFile={setCriaPendingFile} criaFileRef={criaFileRef} criaOnFilePicked={criaOnFilePicked} />'
    );

    html = html.replace(
      'function ChatView({ messages, loading, input, setInput, onSend, scrollRef, voiceGender, elevenKey, elevenVoiceId }) {',
      'function ChatView({ messages, loading, input, setInput, onSend, scrollRef, voiceGender, elevenKey, elevenVoiceId, criaPendingFile, setCriaPendingFile, criaFileRef, criaOnFilePicked }) {'
    );

    html = html.replace(
      'const text = input.trim();\n    if (!text || loading) return;',
      'var text = input.trim();\n    if (loading) return;\n    if (!text && !criaPendingFile) return;\n    if (!text && criaPendingFile) text = criaPendingFile.kind==="image" ? "(imagem)" : ("Analisa: "+(criaPendingFile.name||"arquivo"));'
    );

    html = html.replace(
      'const nextMessages = [...messages, { role: "user", text }];\n    setMessages(nextMessages);\n    setInput("");',
      'var _attachNote="", _imgFromFile=null;\n' +
      '    if (criaPendingFile){ var p=criaPendingFile; if(p.kind==="image"){ _imgFromFile={mime:p.mime,data:p.data}; text+="\\n[img:"+p.name+"]"; } else { _attachNote="\\n\\n[ARQUIVO:"+p.name+"]\\n"+(p.text||""); text+="\\n(anexei "+p.name+")"; } }\n' +
      '    const nextMessages = [...messages, { role: "user", text: text }];\n    setMessages(nextMessages);\n    setInput("");\n    setCriaPendingFile(null);'
    );

    if (html.indexOf('_attachNote') >= 0) {
      html = html.replace(
        'var _hist = nextMessages;\n      if (_webNote) _hist = nextMessages.concat([{ role: "user", text: "(contexto interno):" + _webNote }]);',
        'var _hist = nextMessages;\n      if (_attachNote) _hist = nextMessages.concat([{ role: "user", text: "(arquivo):" + _attachNote }]);\n      if (_webNote) _hist = _hist.concat([{ role: "user", text: "(contexto interno):" + _webNote }]);'
      );
      html = html.replace(
        'askCria(_hist, { voice: false, image: image || null })',
        'askCria(_hist, { voice: false, image: _imgFromFile || image || null })'
      );
    }

    html = html.replace(
      '<button style={styles.settingsBtn} onClick={() => setShowSettings((v) => !v)} aria-label="Configura\u00e7\u00f5es">',
      '<button type="button" onClick={criaNewChat} style={{...styles.settingsBtn, marginRight:6}} title="Novo chat" aria-label="Novo chat">\ud83d\udcac+</button>\n        <button style={styles.settingsBtn} onClick={() => setShowSettings((v) => !v)} aria-label="Configura\u00e7\u00f5es">'
    );

    html = html.replace(
      '<form style={styles.inputRow} onSubmit={handleSubmit}>\n        <button\n          type="button"\n          onClick={() => (screen.sharing ? screen.stop() : screen.start())}',
      '{criaPendingFile ? <div style={{display:"flex",gap:8,padding:"6px 12px",fontSize:12}}><span>\ud83d\udcce {criaPendingFile.name}</span><button type="button" onClick={()=>setCriaPendingFile(null)} style={{border:"none",background:"transparent",color:"#f0c014"}}>\u2715</button></div> : null}\n' +
      '      <form style={styles.inputRow} onSubmit={handleSubmit}>\n' +
      '        <input ref={criaFileRef} type="file" accept="*/*" style={{display:"none"}} onChange={criaOnFilePicked} />\n' +
      '        <button type="button" onClick={()=>criaFileRef&&criaFileRef.current&&criaFileRef.current.click()} style={styles.screenBtn} title="Arquivo">\ud83d\udcce</button>\n' +
      '        <button\n          type="button"\n          onClick={() => (screen.sharing ? screen.stop() : screen.start())}'
    );

    html = html.replace(
      'disabled={loading || !input.trim()}>\n          Enviar',
      'disabled={loading || (!input.trim() && !criaPendingFile)}>\n          Enviar'
    );

  } catch (e) {
    console.warn('CRIA_PATCH_CHATPLUS error', e);
  }
  return html;
};
