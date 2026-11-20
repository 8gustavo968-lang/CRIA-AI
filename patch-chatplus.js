window.CRIA_PATCH_CHATPLUS = function(html) {
  try {
    if (html.indexOf('CRIA_CHATPLUS_V134') >= 0) return html;

    if (html.indexOf('criaPendingFile') < 0) {
      html = html.replace(
        'const [input, setInput] = useState("");',
        'const [input, setInput] = useState("");\n' +
        '  /* CRIA_CHATPLUS_V134 */\n' +
        '  const [criaPendingFile, setCriaPendingFile] = useState(null);\n' +
        '  const criaFileRef = useRef(null);\n' +
        '  function criaNewChat(){\n' +
        '    if (loading) return;\n' +
        '    setMessages([{ role: "assistant", text: "chat novo|||pode mandar texto, foto ou qualquer arquivo" }]);\n' +
        '    setInput("");\n' +
        '    setCriaPendingFile(null);\n' +
        '  }\n' +
        '  function criaReadAnyFile(file){\n' +
        '    return new Promise(function(resolve, reject){\n' +
        '      if (!file) return reject(new Error("sem arquivo"));\n' +
        '      var name = file.name || "arquivo";\n' +
        '      var mime = file.type || "application/octet-stream";\n' +
        '      var size = file.size || 0;\n' +
        '      var isImg = /^image\\//i.test(mime) || /\\.(png|jpe?g|gif|webp|bmp)$/i.test(name);\n' +
        '      var isText = /^text\\//i.test(mime) || /\\.(txt|md|json|csv|tsv|xml|html?|css|js|ts|jsx|tsx|py|java|c|cpp|h|rs|go|rb|php|sql|log|yml|yaml|toml|env|sh)$/i.test(name);\n' +
        '      var maxText = 200000;\n' +
        '      var maxBin = 4 * 1024 * 1024;\n' +
        '      if (isImg) {\n' +
        '        if (size > maxBin) return reject(new Error("imagem grande demais (max 4MB)"));\n' +
        '        var r = new FileReader();\n' +
        '        r.onload = function(){\n' +
        '          var dataUrl = String(r.result || "");\n' +
        '          var m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);\n' +
        '          if (!m) return reject(new Error("falha ao ler imagem"));\n' +
        '          resolve({ kind: "image", name: name, mime: m[1], data: m[2], size: size });\n' +
        '        };\n' +
        '        r.onerror = function(){ reject(new Error("erro leitura imagem")); };\n' +
        '        r.readAsDataURL(file);\n' +
        '        return;\n' +
        '      }\n' +
        '      if (isText || size < 512 * 1024) {\n' +
        '        var rt = new FileReader();\n' +
        '        rt.onload = function(){\n' +
        '          var txt = String(rt.result || "");\n' +
        '          if (txt.length > maxText) txt = txt.slice(0, maxText) + "\\n\\n\u2026[arquivo cortado]";\n' +
        '          var bad = 0;\n' +
        '          for (var i = 0; i < Math.min(txt.length, 2000); i++) { if (txt.charCodeAt(i) === 0) bad++; }\n' +
        '          if (bad > 5 && !isText) {\n' +
        '            resolve({ kind: "binary", name: name, mime: mime, size: size, text: "[bin\u00e1rio: " + name + " \u00b7 " + Math.round(size/1024) + " KB]" });\n' +
        '          } else {\n' +
        '            resolve({ kind: "text", name: name, mime: mime, size: size, text: txt });\n' +
        '          }\n' +
        '        };\n' +
        '        rt.onerror = function(){ reject(new Error("erro leitura")); };\n' +
        '        rt.readAsText(file);\n' +
        '        return;\n' +
        '      }\n' +
        '      resolve({ kind: "binary", name: name, mime: mime, size: size, text: "[arquivo: " + name + " \u00b7 " + Math.round(size/1024) + " KB]" });\n' +
        '    });\n' +
        '  }\n' +
        '  async function criaOnFilePicked(e){\n' +
        '    var f = e.target.files && e.target.files[0];\n' +
        '    e.target.value = "";\n' +
        '    if (!f) return;\n' +
        '    try { setCriaPendingFile(await criaReadAnyFile(f)); }\n' +
        '    catch (err) { setMessages(function(prev){ return prev.concat([{ role: "assistant", text: "n\u00e3o li esse arquivo: " + (err.message || err) }]); }); }\n' +
        '  }\n'
      );
    }

    if (html.indexOf('CRIA_CHATPLUS_SEND') < 0) {
      html = html.replace(
        'const text = input.trim();\n    if (!text || loading) return;',
        'var text = input.trim();\n    /* CRIA_CHATPLUS_SEND */\n' +
        '    var _pf = (typeof criaPendingFile !== "undefined") ? criaPendingFile : null;\n' +
        '    if (loading) return;\n' +
        '    if (!text && !_pf) return;\n' +
        '    if (!text && _pf) text = _pf.kind === "image" ? "(imagem anexada)" : ("Analisa este arquivo: " + (_pf.name || "arquivo"));'
      );
    }

    if (html.indexOf('CRIA_CHATPLUS_ATTACH') < 0) {
      html = html.replace(
        'const nextMessages = [...messages, { role: "user", text }];\n    setMessages(nextMessages);\n    setInput("");',
        'var _attachNote = "";\n' +
        '    var _imgFromFile = null;\n' +
        '    if (typeof criaPendingFile !== "undefined" && criaPendingFile) {\n' +
        '      var _pf2 = criaPendingFile;\n' +
        '      if (_pf2.kind === "image") {\n' +
        '        _imgFromFile = { mime: _pf2.mime, data: _pf2.data };\n' +
        '        text = text + "\\n[arquivo imagem: " + _pf2.name + "]";\n' +
        '      } else {\n' +
        '        _attachNote = "\\n\\n[ARQUIVO: " + _pf2.name + "]\\n" + (_pf2.text || "");\n' +
        '        text = text + "\\n(anexei " + _pf2.name + ")";\n' +
        '      }\n' +
        '    }\n' +
        '    const nextMessages = [...messages, { role: "user", text: text }];\n' +
        '    setMessages(nextMessages);\n' +
        '    setInput("");\n' +
        '    if (typeof setCriaPendingFile === "function") setCriaPendingFile(null);\n' +
        '    /* CRIA_CHATPLUS_ATTACH */'
      );
      html = html.replace(
        'var _hist = nextMessages;\n      if (_webNote) _hist = nextMessages.concat([{ role: "user", text: "(contexto interno):" + _webNote }]);',
        'var _hist = nextMessages;\n' +
        '      if (_attachNote) _hist = nextMessages.concat([{ role: "user", text: "(conteudo do arquivo):" + _attachNote }]);\n' +
        '      if (_webNote) _hist = _hist.concat([{ role: "user", text: "(contexto interno):" + _webNote }]);'
      );
      html = html.replace(
        'askCria(_hist, { voice: false, image: image || null })',
        'askCria(_hist, { voice: false, image: _imgFromFile || image || null })'
      );
    }

    if (html.indexOf('CRIA_NEWCHAT_BTN') < 0) {
      html = html.replace(
        '<button style={styles.settingsBtn} onClick={() => setShowSettings((v) => !v)} aria-label="Configura\u00e7\u00f5es">',
        '<button type="button" onClick={criaNewChat} style={{ ...styles.settingsBtn, marginRight: 6 }} title="Novo bate-papo" aria-label="Novo chat">{/* CRIA_NEWCHAT_BTN */}\ud83d\udcac+</button>\n' +
        '        <button style={styles.settingsBtn} onClick={() => setShowSettings((v) => !v)} aria-label="Configura\u00e7\u00f5es">'
      );
    }

    if (html.indexOf('CRIA_FILE_BTN') < 0) {
      html = html.replace(
        '<button\n          type="button"\n          onClick={() => (screen.sharing ? screen.stop() : screen.start())}',
        '<input ref={criaFileRef} type="file" accept="*/*" style={{ display: "none" }} onChange={criaOnFilePicked} />\n' +
        '        <button type="button" onClick={() => criaFileRef.current && criaFileRef.current.click()} style={styles.screenBtn} title="Anexar arquivo" aria-label="Anexar">{/* CRIA_FILE_BTN */}\ud83d\udcce</button>\n' +
        '        <button\n          type="button"\n          onClick={() => (screen.sharing ? screen.stop() : screen.start())}'
      );
    }

    if (html.indexOf('CRIA_FILE_CHIP') < 0) {
      html = html.replace(
        '<form style={styles.inputRow} onSubmit={handleSubmit}>',
        '{criaPendingFile && (\n' +
        '        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", fontSize: 12 }}>{/* CRIA_FILE_CHIP */}\n' +
        '          <span>\ud83d\udcce {criaPendingFile.name} ({criaPendingFile.kind})</span>\n' +
        '          <button type="button" onClick={() => setCriaPendingFile(null)} style={{ border: "none", background: "transparent", color: "#f0c014", cursor: "pointer" }}>\u2715</button>\n' +
        '        </div>\n' +
        '      )}\n' +
        '      <form style={styles.inputRow} onSubmit={handleSubmit}>'
      );
    }

    html = html.replace(
      'disabled={loading || !input.trim()}',
      'disabled={loading || (!input.trim() && !criaPendingFile)}'
    );
  } catch (e) {
    console.warn('CRIA_PATCH_CHATPLUS error', e);
  }
  return html;
};
