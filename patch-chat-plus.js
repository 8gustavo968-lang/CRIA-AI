window.CRIA_PATCH_CHAT_PLUS = function(html) {
  try {
    // Sempre reaplica UI crítica (pode rodar por último)

    // ---- STATE (só se faltar) ----
    if (html.indexOf('const [showLogin, setShowLogin]') < 0) {
      var stateBlock =
        '  const [showLogin, setShowLogin] = useState(false);\n' +
        '  const [showHistory, setShowHistory] = useState(false);\n' +
        '  const [showConnectors, setShowConnectors] = useState(false);\n' +
        '  const [loginName, setLoginName] = useState("");\n' +
        '  const [loginPin, setLoginPin] = useState("");\n' +
        '  const [loginError, setLoginError] = useState("");\n' +
        '  const [chatList, setChatList] = useState([]);\n' +
        '  const [chatId, setChatId] = useState("");\n' +
        '  const [pendingFile, setPendingFile] = useState(null);\n' +
        '  const [connectors, setConnectors] = useState([]);\n' +
        '  const [connLoading, setConnLoading] = useState(false);\n' +
        '  const [connMsg, setConnMsg] = useState("");\n';

      if (html.indexOf('const [composioOn, setComposioOn]') >= 0) {
        html = html.replace(
          /const \[composioOn, setComposioOn\] = useState\([^;]*\);/,
          function(m) { return m + '\n' + stateBlock; }
        );
      } else if (html.indexOf('const [voiceGender, setVoiceGender]') >= 0) {
        html = html.replace(
          /const \[voiceGender, setVoiceGender\] = useState\([^;]*\);/,
          function(m) { return m + '\n' + stateBlock; }
        );
      } else {
        html = html.replace(
          'const [showSettings, setShowSettings] = useState(false);',
          'const [showSettings, setShowSettings] = useState(false);\n' + stateBlock
        );
      }
    }

    // ---- HELPERS (só se faltar) ----
    if (html.indexOf('function criaChatsKey') < 0) {
      var helpers =
        '  function criaChatsKey(uid){ return "cria_chats_v1_" + (uid || "eu"); }\n' +
        '  function criaLoadChats(uid){ try { var a = JSON.parse(localStorage.getItem(criaChatsKey(uid)) || "[]"); return Array.isArray(a) ? a : []; } catch(e){ return []; } }\n' +
        '  function criaSaveChats(uid, list){ try { localStorage.setItem(criaChatsKey(uid), JSON.stringify(list || [])); } catch(e){} }\n' +
        '  function refreshChatList(){ var uid = (typeof userId !== "undefined" && userId) ? userId : "eu"; setChatList(criaLoadChats(uid)); }\n' +
        '  function persistCurrentChat(){\n' +
        '    try {\n' +
        '      var uid = (typeof userId !== "undefined" && userId) ? userId : "eu";\n' +
        '      var list = criaLoadChats(uid);\n' +
        '      var id = chatId;\n' +
        '      if (!id) { id = "c_" + Date.now(); setChatId(id); try { localStorage.setItem("cria_chat_id_" + uid, id); } catch(e){} }\n' +
        '      var title = "Nova conversa";\n' +
        '      var msgs = messages || [];\n' +
        '      for (var i = 0; i < msgs.length; i++) { if (msgs[i].role === "user" && msgs[i].text) { title = String(msgs[i].text).slice(0, 42); break; } }\n' +
        '      var found = false;\n' +
        '      for (var j = 0; j < list.length; j++) { if (list[j].id === id) { list[j] = { id: id, title: title, updated: Date.now(), messages: msgs }; found = true; break; } }\n' +
        '      if (!found) list.unshift({ id: id, title: title, updated: Date.now(), messages: msgs });\n' +
        '      list.sort(function(a,b){ return (b.updated||0)-(a.updated||0); });\n' +
        '      if (list.length > 40) list = list.slice(0, 40);\n' +
        '      criaSaveChats(uid, list);\n' +
        '      setChatList(list);\n' +
        '    } catch(e) {}\n' +
        '  }\n' +
        '  function openChat(id){\n' +
        '    var uid = (typeof userId !== "undefined" && userId) ? userId : "eu";\n' +
        '    var list = criaLoadChats(uid);\n' +
        '    for (var i = 0; i < list.length; i++) {\n' +
        '      if (list[i].id === id) {\n' +
        '        setChatId(id);\n' +
        '        try { localStorage.setItem("cria_chat_id_" + uid, id); } catch(e){}\n' +
        '        setMessages((list[i].messages && list[i].messages.length) ? list[i].messages : [{ role: "assistant", text: "Oi! Continuando essa conversa." }]);\n' +
        '        setShowHistory(false);\n' +
        '        setInput("");\n' +
        '        setPendingFile(null);\n' +
        '        return;\n' +
        '      }\n' +
        '    }\n' +
        '  }\n' +
        '  function deleteChat(id){\n' +
        '    var uid = (typeof userId !== "undefined" && userId) ? userId : "eu";\n' +
        '    var list = criaLoadChats(uid).filter(function(c){ return c.id !== id; });\n' +
        '    criaSaveChats(uid, list);\n' +
        '    setChatList(list);\n' +
        '    if (chatId === id) {\n' +
        '      setChatId("");\n' +
        '      try { localStorage.removeItem("cria_chat_id_" + uid); } catch(e){}\n' +
        '      setMessages([{ role: "assistant", text: "Oi! Nova conversa." }]);\n' +
        '      setInput("");\n' +
        '    }\n' +
        '  }\n' +
        '  function doLogin(){\n' +
        '    setLoginError("");\n' +
        '    var name = String(loginName || "").trim().toLowerCase().replace(/[^a-z0-9_\-]/g, "").slice(0, 24);\n' +
        '    if (!name) { setLoginError("Digite um nome de usuário"); return; }\n' +
        '    var pin = String(loginPin || "");\n' +
        '    try {\n' +
        '      var storeKey = "cria_pin_" + name;\n' +
        '      var saved = localStorage.getItem(storeKey);\n' +
        '      if (saved) { if (saved !== pin) { setLoginError("PIN incorreto"); return; } }\n' +
        '      else if (pin) localStorage.setItem(storeKey, pin);\n' +
        '      if (typeof switchUser === "function") switchUser(name);\n' +
        '      else if (typeof setUserId === "function") { setUserId(name); try { localStorage.setItem("cria_user_id", name); } catch(e){} }\n' +
        '      setShowLogin(false);\n' +
        '      setLoginPin("");\n' +
        '      setTimeout(refreshChatList, 80);\n' +
        '    } catch(e) { setLoginError(String(e.message || e)); }\n' +
        '  }\n' +
        '  function doLogout(){\n' +
        '    if (typeof switchUser === "function") switchUser("eu");\n' +
        '    else if (typeof setUserId === "function") setUserId("eu");\n' +
        '    setShowLogin(false);\n' +
        '  }\n' +
        '  async function loadConnectors(){\n' +
        '    setConnLoading(true); setConnMsg(""); setConnectors([]);\n' +
        '    try {\n' +
        '      if (typeof composioEnsureSession !== "function" || typeof composioRequest !== "function") {\n' +
        '        setConnMsg("Composio offline — confira a chave em Configurações."); setConnLoading(false); return;\n' +
        '      }\n' +
        '      var uid = (typeof userId !== "undefined" && userId) ? userId : "eu";\n' +
        '      var sid = await composioEnsureSession(uid, false);\n' +
        '      var data = await composioRequest("/api/v3.1/tool_router/session/" + sid + "/toolkits", "GET");\n' +
        '      var items = data.items || data.toolkits || [];\n' +
        '      if (!items.length) {\n' +
        '        items = ["gmail","github","slack","notion","googlecalendar","googledrive","discord","trello","linear","youtube","spotify","twitter","outlook","whatsapp"].map(function(s){ return { slug: s, name: s, connected_account: null }; });\n' +
        '      }\n' +
        '      setConnectors(items);\n' +
        '    } catch(e) { setConnMsg("Erro: " + (e.message || e)); }\n' +
        '    setConnLoading(false);\n' +
        '  }\n' +
        '  async function connectOne(slug){\n' +
        '    setConnMsg("Gerando link…");\n' +
        '    try {\n' +
        '      var uid = (typeof userId !== "undefined" && userId) ? userId : "eu";\n' +
        '      var sid = await composioEnsureSession(uid, false);\n' +
        '      var conn = await composioConnectToolkit(sid, slug);\n' +
        '      if (conn && conn.url) { setConnMsg(conn.url); try { window.open(conn.url, "_blank"); } catch(e){} }\n' +
        '      else if (conn && conn.status === "active") { setConnMsg(slug + " já conectado"); loadConnectors(); }\n' +
        '      else setConnMsg("Sem link para " + slug);\n' +
        '    } catch(e) { setConnMsg(String(e.message || e)); }\n' +
        '  }\n' +
        '  function onPickFile(ev){\n' +
        '    var f = ev.target.files && ev.target.files[0];\n' +
        '    if (!f) return;\n' +
        '    if (f.size > 12 * 1024 * 1024) { alert("Máx 12MB"); return; }\n' +
        '    var reader = new FileReader();\n' +
        '    var isImg = /^image\//.test(f.type);\n' +
        '    var isText = /^text\//.test(f.type) || /\.(txt|md|csv|json|log)$/i.test(f.name);\n' +
        '    reader.onload = function(){\n' +
        '      try {\n' +
        '        if (isImg) {\n' +
        '          var dataUrl = String(reader.result || "");\n' +
        '          var m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);\n' +
        '          if (!m) { alert("Falha ao ler imagem"); return; }\n' +
        '          setPendingFile({ kind: "image", name: f.name, mime: m[1], data: m[2] });\n' +
        '        } else if (isText) {\n' +
        '          setPendingFile({ kind: "text", name: f.name, text: String(reader.result || "").slice(0, 80000) });\n' +
        '        } else {\n' +
        '          setPendingFile({ kind: "meta", name: f.name, mime: f.type || "application/octet-stream", size: f.size });\n' +
        '        }\n' +
        '      } catch(e) { alert("Erro: " + e.message); }\n' +
        '    };\n' +
        '    if (isImg) reader.readAsDataURL(f);\n' +
        '    else if (isText) reader.readAsText(f);\n' +
        '    else reader.readAsDataURL(f);\n' +
        '    try { ev.target.value = ""; } catch(e){}\n' +
        '  }\n' +
        '  useEffect(function(){ try { refreshChatList(); } catch(e){} }, [typeof userId !== "undefined" ? userId : "eu"]);\n' +
        '  useEffect(function(){ try { persistCurrentChat(); } catch(e){} }, [messages, chatId]);\n' +
        '  ';

      if (html.indexOf('async function sendMessage') >= 0) {
        html = html.replace('async function sendMessage', helpers + 'async function sendMessage');
      }
    }

    // ---- sendMessage: arquivo ----
    if (html.indexOf('_criaFileHandled') < 0) {
      if (html.indexOf('const text = (forcedText != null') >= 0) {
        html = html.replace(
          'const text = (forcedText != null && String(forcedText).trim() ? String(forcedText) : input).trim();\n    if (!text || loading) return;',
          'var text = (forcedText != null && String(forcedText).trim() ? String(forcedText) : input).trim();\n    var _file = pendingFile;\n    /* _criaFileHandled */\n    if (_file && _file.kind === "text" && _file.text) text = (text ? text + "\n\n" : "") + "[Arquivo: " + _file.name + "]\n" + _file.text;\n    else if (_file && _file.kind === "meta") text = (text ? text + "\n\n" : "") + "[Arquivo: " + _file.name + " (" + (_file.mime || "?") + ")]";\n    if ((!text && !(_file && _file.kind === "image")) || loading) return;\n    if (!text && _file && _file.kind === "image") text = "Analisa essa imagem e descreve o que você vê, com detalhes úteis.";'
        );
      }
      html = html.replace(
        'setMessages(nextMessages);\n    setInput("");\n    setLoading(true);',
        'setMessages(nextMessages);\n    setInput("");\n    setPendingFile(null);\n    setLoading(true);\n    var _imgArg = image || null;\n    if (_file && _file.kind === "image" && _file.data) _imgArg = { mime: _file.mime || "image/jpeg", data: _file.data };'
      );
      html = html.replace(
        /askCria\(nextMessages, \{ voice: false, image: image \|\| null \}\)/g,
        'askCria(nextMessages, { voice: false, image: (typeof _imgArg !== "undefined" ? _imgArg : (image || null)) })'
      );
    }

    // ---- HEADER: remove botões duplicados e reinsere limpos ----
    // strip previous login/history/connectors buttons we may have added
    html = html.replace(/<button type="button" style=\{styles\.settingsBtn\} onClick=\{function\(\)\{ setShowLogin\(true\); \}\}[^>]*>👤<\/button>\s*/g, '');
    html = html.replace(/<button type="button" style=\{styles\.settingsBtn\} onClick=\{function\(\)\{ refreshChatList\(\); setShowHistory\(true\); \}\}[^>]*>💬<\/button>\s*/g, '');
    html = html.replace(/<button type="button" style=\{styles\.settingsBtn\} onClick=\{function\(\)\{ setShowConnectors\(true\); loadConnectors\(\); \}\}[^>]*>🔌<\/button>\s*/g, '');

    var headerBtns =
      '<button type="button" style={styles.settingsBtn} onClick={function(){ setShowLogin(true); }} title="Login">👤</button>\n' +
      '        <button type="button" style={styles.settingsBtn} onClick={function(){ try{refreshChatList();}catch(e){} setShowHistory(true); }} title="Historico">💬</button>\n' +
      '        <button type="button" style={styles.settingsBtn} onClick={function(){ setShowConnectors(true); try{loadConnectors();}catch(e){} }} title="Conectores">🔌</button>\n' +
      '        ';

    // insert before settings gear
    if (html.indexOf('title="Login"') < 0) {
      if (/onClick=\{\(\) => setShowSettings/.test(html)) {
        html = html.replace(
          /<button style=\{styles\.settingsBtn\} onClick=\{\(\) => setShowSettings/,
          headerBtns + '<button style={styles.settingsBtn} onClick={() => setShowSettings'
        );
      } else if (html.indexOf('startNewChat') >= 0) {
        html = html.replace(
          '<button type="button" style={styles.settingsBtn} onClick={startNewChat}',
          headerBtns + '<button type="button" style={styles.settingsBtn} onClick={startNewChat}'
        );
      }
    }

    // ---- MODALS ----
    if (html.indexOf('CRIA_MODAL_LOGIN') < 0) {
      var modals =
        '{/* CRIA_MODAL_LOGIN */}\n' +
        '      {showLogin && (\n' +
        '        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:80,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={function(){setShowLogin(false);}}>\n' +
        '          <div style={{background:"#1a2035",border:"1px solid #3A4566",borderRadius:16,padding:20,width:"100%",maxWidth:340}} onClick={function(e){e.stopPropagation();}}>\n' +
        '            <p style={{margin:"0 0 8px",color:"#F2B705",fontWeight:700}}>Login local</p>\n' +
        '            <p style={{margin:"0 0 12px",color:"#9AA3B8",fontSize:12}}>Só neste aparelho. PIN opcional.</p>\n' +
        '            <input style={{width:"100%",marginBottom:8,padding:10,borderRadius:8,border:"1px solid #3A4566",background:"#0F1320",color:"#fff"}} placeholder="usuario" value={loginName} onChange={function(e){setLoginName(e.target.value);}} />\n' +
        '            <input style={{width:"100%",marginBottom:8,padding:10,borderRadius:8,border:"1px solid #3A4566",background:"#0F1320",color:"#fff"}} type="password" placeholder="PIN opcional" value={loginPin} onChange={function(e){setLoginPin(e.target.value);}} />\n' +
        '            {loginError ? <p style={{color:"#ff6b6b",fontSize:12}}>{loginError}</p> : null}\n' +
        '            <div style={{display:"flex",gap:8}}>\n' +
        '              <button type="button" onClick={doLogin} style={{flex:1,padding:10,borderRadius:8,border:"none",background:"#F2B705",color:"#111",fontWeight:700,cursor:"pointer"}}>Entrar</button>\n' +
        '              <button type="button" onClick={doLogout} style={{flex:1,padding:10,borderRadius:8,border:"1px solid #3A4566",background:"transparent",color:"#fff",cursor:"pointer"}}>Sair</button>\n' +
        '            </div>\n' +
        '          </div>\n' +
        '        </div>\n' +
        '      )}\n' +
        '      {showHistory && (\n' +
        '        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:80,display:"flex",justifyContent:"flex-end"}} onClick={function(){setShowHistory(false);}}>\n' +
        '          <div style={{width:"min(360px,100%)",height:"100%",background:"#121826",borderLeft:"1px solid #3A4566",padding:16,overflowY:"auto"}} onClick={function(e){e.stopPropagation();}}>\n' +
        '            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>\n' +
        '              <p style={{margin:0,color:"#F2B705",fontWeight:700}}>Historico</p>\n' +
        '              <button type="button" onClick={function(){ setMessages([{role:"assistant",text:"Oi! Nova conversa."}]); setChatId(""); setInput(""); setPendingFile(null); setShowHistory(false); }} style={{padding:"6px 10px",borderRadius:8,border:"1px solid #3A4566",background:"#1a2035",color:"#fff",cursor:"pointer"}}>Nova</button>\n' +
        '            </div>\n' +
        '            {(chatList || []).length === 0 && <p style={{color:"#9AA3B8",fontSize:13}}>Nenhuma conversa ainda.</p>}\n' +
        '            {(chatList || []).map(function(c){ return (\n' +
        '              <div key={c.id} style={{border:"1px solid #2A3148",borderRadius:12,padding:10,marginBottom:8,background: c.id === chatId ? "#1e2740" : "#0F1320"}}>\n' +
        '                <button type="button" onClick={function(){ openChat(c.id); }} style={{background:"transparent",border:"none",color:"#E8ECF5",textAlign:"left",width:"100%",cursor:"pointer",fontSize:13}}>{c.title || "Conversa"}</button>\n' +
        '                <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>\n' +
        '                  <span style={{color:"#6b7280",fontSize:11}}>{c.updated ? new Date(c.updated).toLocaleString() : ""}</span>\n' +
        '                  <button type="button" onClick={function(){ deleteChat(c.id); }} style={{background:"transparent",border:"none",color:"#ff6b6b",cursor:"pointer",fontSize:12}}>apagar</button>\n' +
        '                </div>\n' +
        '              </div>\n' +
        '            ); })}\n' +
        '          </div>\n' +
        '        </div>\n' +
        '      )}\n' +
        '      {showConnectors && (\n' +
        '        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:80,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={function(){setShowConnectors(false);}}>\n' +
        '          <div style={{background:"#1a2035",border:"1px solid #3A4566",borderRadius:16,padding:16,width:"100%",maxWidth:420,maxHeight:"80vh",overflowY:"auto"}} onClick={function(e){e.stopPropagation();}}>\n' +
        '            <p style={{margin:"0 0 8px",color:"#F2B705",fontWeight:700}}>Conectores</p>\n' +
        '            {connLoading && <p style={{color:"#9AA3B8"}}>Carregando...</p>}\n' +
        '            {connMsg ? <p style={{color:"#F2B705",fontSize:11,wordBreak:"break-all"}}>{connMsg}</p> : null}\n' +
        '            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>\n' +
        '              {(connectors || []).slice(0, 40).map(function(c, idx){ var slug = c.slug || c.name || ("x"+idx); var ok = !!c.connected_account; return (\n' +
        '                <button key={slug + idx} type="button" onClick={function(){ connectOne(slug); }} style={{textAlign:"left",padding:10,borderRadius:12,border:"1px solid #2A3148",background: ok ? "#1a3a2a" : "#0F1320",color:"#E8ECF5",cursor:"pointer",fontSize:12}}>\n' +
        '                  <div style={{fontWeight:600}}>{c.name || slug}</div>\n' +
        '                  <div style={{color: ok ? "#6ee7b7" : "#9AA3B8",fontSize:11}}>{ok ? "conectado" : "conectar"}</div>\n' +
        '                </button>\n' +
        '              ); })}\n' +
        '            </div>\n' +
        '            <button type="button" onClick={loadConnectors} style={{marginTop:12,width:"100%",padding:10,borderRadius:8,border:"1px solid #3A4566",background:"#0F1320",color:"#fff",cursor:"pointer"}}>Atualizar</button>\n' +
        '          </div>\n' +
        '        </div>\n' +
        '      )}\n';

      if (html.indexOf('{showSettings && (') >= 0) {
        html = html.replace('{showSettings && (', modals + '      {showSettings && (');
      }
    }

    // ---- FILE BUTTON (força inserção) ----
    html = html.replace(/<input[^>]*data-cria-file="1"[^>]*>\s*/g, '');
    html = html.replace(/<button type="button"[^>]*aria-label="Arquivo"[^>]*>[^<]*<\/button>\s*/g, '');
    html = html.replace(/\{pendingFile \? <span[^>]*>[\s\S]*?<\/span> : null\}\s*/g, '');

    var fileUi =
      '<input id="cria-file-input" type="file" accept="image/*,.txt,.md,.csv,.json,.log,text/*" style={{display:"none"}} onChange={onPickFile} />\n' +
      '        <button type="button" onClick={function(){ var el = document.getElementById("cria-file-input"); if(el) el.click(); }} style={{ ...styles.screenBtn, ...(pendingFile ? styles.screenBtnActive : {}) }} title={pendingFile ? pendingFile.name : "Arquivo"}>📎</button>\n' +
      '        {pendingFile ? <button type="button" onClick={function(){ setPendingFile(null); }} style={{background:"transparent",border:"none",color:"#F2B705",fontSize:11,cursor:"pointer"}}>{String(pendingFile.name||"arquivo").slice(0,12)} ×</button> : null}\n' +
      '        ';

    if (html.indexOf('id="cria-file-input"') < 0 && html.indexOf('id=\"cria-file-input\"') < 0) {
      // after screen share button emoji
      if (html.indexOf('>\n          🖥\n        </button>') >= 0) {
        html = html.replace(
          '>\n          🖥\n        </button>\n        <input',
          '>\n          🖥\n        </button>\n        ' + fileUi + '<input'
        );
      } else if (html.indexOf('🖥') >= 0) {
        html = html.replace(
          '</button>\n        <input\n          style={styles.input}',
          '</button>\n        ' + fileUi + '<input\n          style={styles.input}'
        );
      }
    }

    // send disabled when only image
    html = html.replace(
      /disabled=\{loading \|\| !input\.trim\(\)\}/g,
      'disabled={loading || (!input.trim() && !(pendingFile && pendingFile.kind === "image"))}'
    );

    // Expose pendingFile to ChatView via window bridge (evita props quebradas)
    html = html.replace(
      /function ChatView\(\{[^}]+\}\) \{/
      ,
      function(sig) {
        if (sig.indexOf('pendingFile') >= 0) return sig;
        // don't break signature — use window bridge instead
        return sig;
      }
    );

    // Bridge: sync pendingFile to window for ChatView file button that uses onPickFile from scope - onPickFile is in parent App, file button is in ChatView!
    // CRITICAL FIX: file button is INSIDE ChatView but onPickFile/pendingFile are in App.
    // Must pass as props OR use window.

    // Force window bridge each render in App - inject near return of main component is hard.
    // Better: put file controls in App header area not ChatView.

  } catch (e) {
    console.warn('CRIA_PATCH_CHAT_PLUS error', e);
  }
  return html;
};

// Second pass fix: inject file bar ABOVE ChatView by patching the chat mode render
window.CRIA_PATCH_CHAT_PLUS_FIX = function(html) {
  try {
    // Bridge props into ChatView call - restore full props after voice patch
    html = html.replace(
      /onSend=\{sendMessage\} scrollRef=\{scrollRef\}[^/]*\/>/,
      'onSend={sendMessage} scrollRef={scrollRef} voiceGender={voiceGender} elevenKey={typeof elevenKey!=="undefined"?elevenKey:""} elevenVoiceId={typeof elevenVoiceId!=="undefined"?elevenVoiceId:""} pendingFile={pendingFile} setPendingFile={setPendingFile} onPickFile={onPickFile} />'
    );

    // Ensure ChatView accepts these props
    html = html.replace(
      /function ChatView\(\{([^}]+)\}\)/,
      function(_, props) {
        var p = props;
        if (p.indexOf('pendingFile') < 0) p += ', pendingFile, setPendingFile, onPickFile';
        if (p.indexOf('voiceGender') < 0) p += ', voiceGender, elevenKey, elevenVoiceId';
        return 'function ChatView({' + p + '})';
      }
    );

    // If file button inside ChatView references onPickFile - ok if props passed
    // Add fallback window assignment before return in send path
    if (html.indexOf('window.__criaOnPickFile') < 0 && html.indexOf('function onPickFile') >= 0) {
      html = html.replace(
        'function onPickFile(ev){',
        'window.__criaSetPendingFile = setPendingFile;\n  window.__criaOnPickFile = onPickFile;\n  function onPickFile(ev){'
      );
    }

  } catch (e) {
    console.warn('CHAT_PLUS_FIX', e);
  }
  return html;
};
