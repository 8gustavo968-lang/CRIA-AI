window.CRIA_PATCH_CHAT_PLUS = function(html) {
  try {
    if (html.indexOf("const [showLogin, setShowLogin]") < 0) {
      var st =
        "  const [showLogin, setShowLogin] = useState(false);\n" +
        "  const [showHistory, setShowHistory] = useState(false);\n" +
        "  const [showConnectors, setShowConnectors] = useState(false);\n" +
        "  const [loginName, setLoginName] = useState(\"\");\n" +
        "  const [loginPin, setLoginPin] = useState(\"\");\n" +
        "  const [loginError, setLoginError] = useState(\"\");\n" +
        "  const [chatList, setChatList] = useState([]);\n" +
        "  const [chatId, setChatId] = useState(\"\");\n" +
        "  const [pendingFile, setPendingFile] = useState(null);\n" +
        "  const [connectors, setConnectors] = useState([]);\n" +
        "  const [connLoading, setConnLoading] = useState(false);\n" +
        "  const [connMsg, setConnMsg] = useState(\"\");\n";
      if (html.indexOf("const [composioOn, setComposioOn]") >= 0) {
        html = html.replace(/const \[composioOn, setComposioOn\] = useState\([^;]*\);/, function (m) { return m + "\n" + st; });
      } else {
        html = html.replace("const [showSettings, setShowSettings] = useState(false);", "const [showSettings, setShowSettings] = useState(false);\n" + st);
      }
    }

    if (html.indexOf("function criaDoLogin") < 0 && html.indexOf("async function sendMessage") >= 0) {
      var hp =
        "  function criaUid(){ return (typeof userId !== \"undefined\" && userId) ? userId : \"eu\"; }\n" +
        "  function criaLoadChats(){ try { var a = JSON.parse(localStorage.getItem(\"cria_chats_v1_\" + criaUid()) || \"[]\"); return Array.isArray(a) ? a : []; } catch(e){ return []; } }\n" +
        "  function criaSaveChats(list){ try { localStorage.setItem(\"cria_chats_v1_\" + criaUid(), JSON.stringify(list || [])); } catch(e){} }\n" +
        "  function refreshChatList(){ setChatList(criaLoadChats()); }\n" +
        "  function persistCurrentChat(){\n" +
        "    try {\n" +
        "      var list = criaLoadChats(); var id = chatId;\n" +
        "      if (!id) { id = \"c_\" + Date.now(); setChatId(id); }\n" +
        "      var title = \"Nova conversa\"; var msgs = messages || [];\n" +
        "      for (var i = 0; i < msgs.length; i++) if (msgs[i].role === \"user\" && msgs[i].text) { title = String(msgs[i].text).slice(0, 40); break; }\n" +
        "      var found = false;\n" +
        "      for (var j = 0; j < list.length; j++) if (list[j].id === id) { list[j] = { id: id, title: title, updated: Date.now(), messages: msgs }; found = true; break; }\n" +
        "      if (!found) list.unshift({ id: id, title: title, updated: Date.now(), messages: msgs });\n" +
        "      list.sort(function(a,b){ return (b.updated||0)-(a.updated||0); });\n" +
        "      if (list.length > 40) list = list.slice(0, 40);\n" +
        "      criaSaveChats(list); setChatList(list);\n" +
        "    } catch(e) {}\n" +
        "  }\n" +
        "  function openChat(id){\n" +
        "    var list = criaLoadChats();\n" +
        "    for (var i = 0; i < list.length; i++) if (list[i].id === id) {\n" +
        "      setChatId(id); setMessages(list[i].messages && list[i].messages.length ? list[i].messages : [{ role: \"assistant\", text: \"Oi!\" }]);\n" +
        "      setShowHistory(false); setInput(\"\"); setPendingFile(null); return;\n" +
        "    }\n" +
        "  }\n" +
        "  function deleteChat(id){\n" +
        "    var list = criaLoadChats().filter(function(c){ return c.id !== id; });\n" +
        "    criaSaveChats(list); setChatList(list);\n" +
        "    if (chatId === id) { setChatId(\"\"); setMessages([{ role: \"assistant\", text: \"Oi! Nova conversa.\" }]); setInput(\"\"); }\n" +
        "  }\n" +
        "  function criaDoLogin(){\n" +
        "    setLoginError(\"\");\n" +
        "    var name = String(loginName || \"\").trim().toLowerCase().replace(/[^a-z0-9_\\-]/g, \"\").slice(0, 24);\n" +
        "    if (!name) { setLoginError(\"Digite um usuario\"); return; }\n" +
        "    var pin = String(loginPin || \"\");\n" +
        "    try {\n" +
        "      var sk = \"cria_pin_\" + name; var saved = localStorage.getItem(sk);\n" +
        "      if (saved && saved !== pin) { setLoginError(\"PIN incorreto\"); return; }\n" +
        "      if (!saved && pin) localStorage.setItem(sk, pin);\n" +
        "      if (typeof switchUser === \"function\") switchUser(name);\n" +
        "      else if (typeof setUserId === \"function\") { setUserId(name); try { localStorage.setItem(\"cria_user_id\", name); } catch(e){} }\n" +
        "      setShowLogin(false); setLoginPin(\"\"); setTimeout(refreshChatList, 100);\n" +
        "    } catch(e) { setLoginError(String(e.message || e)); }\n" +
        "  }\n" +
        "  function criaDoLogout(){\n" +
        "    if (typeof switchUser === \"function\") switchUser(\"eu\");\n" +
        "    else if (typeof setUserId === \"function\") setUserId(\"eu\");\n" +
        "    setShowLogin(false);\n" +
        "  }\n" +
        "  async function loadConnectors(){\n" +
        "    setConnLoading(true); setConnMsg(\"\"); setConnectors([]);\n" +
        "    try {\n" +
        "      if (typeof composioEnsureSession !== \"function\") { setConnMsg(\"Composio offline\"); setConnLoading(false); return; }\n" +
        "      var sid = await composioEnsureSession(criaUid(), false);\n" +
        "      var data = await composioRequest(\"/api/v3.1/tool_router/session/\" + sid + \"/toolkits\", \"GET\");\n" +
        "      var items = data.items || data.toolkits || [];\n" +
        "      if (!items.length) items = [\"gmail\",\"github\",\"slack\",\"notion\",\"googlecalendar\",\"googledrive\",\"discord\",\"trello\",\"youtube\",\"spotify\"].map(function(s){ return { slug: s, name: s }; });\n" +
        "      setConnectors(items);\n" +
        "    } catch(e) { setConnMsg(String(e.message || e)); }\n" +
        "    setConnLoading(false);\n" +
        "  }\n" +
        "  async function connectOne(slug){\n" +
        "    setConnMsg(\"Gerando link...\");\n" +
        "    try {\n" +
        "      var sid = await composioEnsureSession(criaUid(), false);\n" +
        "      var conn = await composioConnectToolkit(sid, slug);\n" +
        "      if (conn && conn.url) { setConnMsg(conn.url); try { window.open(conn.url, \"_blank\"); } catch(e){} }\n" +
        "      else setConnMsg(slug + \" ok ou sem link\");\n" +
        "    } catch(e) { setConnMsg(String(e.message || e)); }\n" +
        "  }\n" +
        "  function onPickFile(ev){\n" +
        "    var f = ev.target.files && ev.target.files[0]; if (!f) return;\n" +
        "    if (f.size > 12e6) { alert(\"Max 12MB\"); return; }\n" +
        "    var reader = new FileReader();\n" +
        "    var isImg = /^image\\//.test(f.type);\n" +
        "    var isText = /^text\\//.test(f.type) || /\\.(txt|md|csv|json|log)$/i.test(f.name);\n" +
        "    reader.onload = function(){\n" +
        "      try {\n" +
        "        if (isImg) {\n" +
        "          var d = String(reader.result || \"\"); var m = d.match(/^data:([^;]+);base64,(.+)$/);\n" +
        "          if (!m) { alert(\"Falha na imagem\"); return; }\n" +
        "          setPendingFile({ kind: \"image\", name: f.name, mime: m[1], data: m[2] });\n" +
        "        } else if (isText) setPendingFile({ kind: \"text\", name: f.name, text: String(reader.result || \"\").slice(0, 80000) });\n" +
        "        else setPendingFile({ kind: \"meta\", name: f.name, mime: f.type || \"bin\", size: f.size });\n" +
        "      } catch(e) { alert(e.message); }\n" +
        "    };\n" +
        "    if (isImg) reader.readAsDataURL(f); else if (isText) reader.readAsText(f); else reader.readAsDataURL(f);\n" +
        "    try { ev.target.value = \"\"; } catch(e){}\n" +
        "  }\n" +
        "  useEffect(function(){ try { refreshChatList(); } catch(e){} }, [typeof userId !== \"undefined\" ? userId : \"eu\"]);\n" +
        "  useEffect(function(){ try { persistCurrentChat(); } catch(e){} }, [messages, chatId]);\n" +
        "  ";
      html = html.replace("async function sendMessage", hp + "async function sendMessage");
    }

    if (html.indexOf("_criaFileHandled") < 0) {
      html = html.replace(
        "const text = (forcedText != null && String(forcedText).trim() ? String(forcedText) : input).trim();\n    if (!text || loading) return;",
        "var text = (forcedText != null && String(forcedText).trim() ? String(forcedText) : input).trim();\n    var _file = pendingFile;\n    /* _criaFileHandled */\n    if (_file && _file.kind === \"text\" && _file.text) text = (text ? text + \"\\n\\n\" : \"\") + \"[Arquivo: \" + _file.name + \"]\\n\" + _file.text;\n    else if (_file && _file.kind === \"meta\") text = (text ? text + \"\\n\\n\" : \"\") + \"[Arquivo: \" + _file.name + \"]\";\n    if ((!text && !(_file && _file.kind === \"image\")) || loading) return;\n    if (!text && _file && _file.kind === \"image\") text = \"Analisa essa imagem e descreve o que voce ve.\";"
      );
      html = html.replace(
        "setMessages(nextMessages);\n    setInput(\"\");\n    setLoading(true);",
        "setMessages(nextMessages);\n    setInput(\"\");\n    setPendingFile(null);\n    setLoading(true);\n    var _imgArg = image || null;\n    if (_file && _file.kind === \"image\" && _file.data) _imgArg = { mime: _file.mime || \"image/jpeg\", data: _file.data };"
      );
      html = html.replace(
        /askCria\(nextMessages, \{ voice: false, image: image \|\| null \}\)/g,
        "askCria(nextMessages, { voice: false, image: (typeof _imgArg !== \"undefined\" ? _imgArg : (image || null)) })"
      );
    }

    if (html.indexOf('title="Login"') < 0 && html.indexOf("setShowLogin(true)") < 0) {
      var hb =
        '<button type="button" style={styles.settingsBtn} onClick={function(){ setShowLogin(true); }} title="Login">👤</button>\n' +
        '        <button type="button" style={styles.settingsBtn} onClick={function(){ try{refreshChatList();}catch(e){} setShowHistory(true); }} title="Historico">💬</button>\n' +
        '        <button type="button" style={styles.settingsBtn} onClick={function(){ setShowConnectors(true); try{loadConnectors();}catch(e){} }} title="Conectores">🔌</button>\n        ';
      if (html.indexOf("onClick={startNewChat}") >= 0) {
        html = html.replace('<button type="button" style={styles.settingsBtn} onClick={startNewChat}', hb + '<button type="button" style={styles.settingsBtn} onClick={startNewChat}');
      } else {
        html = html.replace(
          /<button style=\{styles\.settingsBtn\} onClick=\{\(\) => setShowSettings/,
          hb + "<button style={styles.settingsBtn} onClick={() => setShowSettings"
        );
      }
    }

    if (html.indexOf("CRIA_MODAL_LOGIN") < 0 && html.indexOf("{showSettings && (") >= 0) {
      var mod =
        '{/* CRIA_MODAL_LOGIN */}\n' +
        '      {showLogin && (\n' +
        '        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:90,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={function(){setShowLogin(false);}}>\n' +
        '          <div style={{background:"#1a2035",border:"1px solid #3A4566",borderRadius:16,padding:20,width:"100%",maxWidth:340}} onClick={function(e){e.stopPropagation();}}>\n' +
        '            <p style={{margin:"0 0 8px",color:"#F2B705",fontWeight:700}}>Login local</p>\n' +
        '            <input style={{width:"100%",marginBottom:8,padding:10,borderRadius:8,border:"1px solid #3A4566",background:"#0F1320",color:"#fff",boxSizing:"border-box"}} placeholder="usuario" value={loginName} onChange={function(e){setLoginName(e.target.value);}} />\n' +
        '            <input style={{width:"100%",marginBottom:8,padding:10,borderRadius:8,border:"1px solid #3A4566",background:"#0F1320",color:"#fff",boxSizing:"border-box"}} type="password" placeholder="PIN opcional" value={loginPin} onChange={function(e){setLoginPin(e.target.value);}} />\n' +
        '            {loginError ? <p style={{color:"#ff6b6b",fontSize:12}}>{loginError}</p> : null}\n' +
        '            <div style={{display:"flex",gap:8}}>\n' +
        '              <button type="button" onClick={criaDoLogin} style={{flex:1,padding:10,borderRadius:8,border:"none",background:"#F2B705",color:"#111",fontWeight:700,cursor:"pointer"}}>Entrar</button>\n' +
        '              <button type="button" onClick={criaDoLogout} style={{flex:1,padding:10,borderRadius:8,border:"1px solid #3A4566",background:"transparent",color:"#fff",cursor:"pointer"}}>Sair</button>\n' +
        '            </div>\n' +
        '          </div>\n' +
        '        </div>\n' +
        '      )}\n' +
        '      {showHistory && (\n' +
        '        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:90,display:"flex",justifyContent:"flex-end"}} onClick={function(){setShowHistory(false);}}>\n' +
        '          <div style={{width:"min(360px,100%)",height:"100%",background:"#121826",borderLeft:"1px solid #3A4566",padding:16,overflowY:"auto"}} onClick={function(e){e.stopPropagation();}}>\n' +
        '            <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>\n' +
        '              <p style={{margin:0,color:"#F2B705",fontWeight:700}}>Historico</p>\n' +
        '              <button type="button" onClick={function(){ setMessages([{role:"assistant",text:"Oi! Nova conversa."}]); setChatId(""); setInput(""); setPendingFile(null); setShowHistory(false); }} style={{padding:"6px 10px",borderRadius:8,border:"1px solid #3A4566",background:"#1a2035",color:"#fff",cursor:"pointer"}}>Nova</button>\n' +
        '            </div>\n' +
        '            {(chatList||[]).length===0 && <p style={{color:"#9AA3B8",fontSize:13}}>Nenhuma conversa ainda.</p>}\n' +
        '            {(chatList||[]).map(function(c){ return (\n' +
        '              <div key={c.id} style={{border:"1px solid #2A3148",borderRadius:12,padding:10,marginBottom:8,background:c.id===chatId?"#1e2740":"#0F1320"}}>\n' +
        '                <button type="button" onClick={function(){ openChat(c.id); }} style={{background:"transparent",border:"none",color:"#E8ECF5",textAlign:"left",width:"100%",cursor:"pointer",fontSize:13}}>{c.title||"Conversa"}</button>\n' +
        '                <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>\n' +
        '                  <span style={{color:"#6b7280",fontSize:11}}>{c.updated?new Date(c.updated).toLocaleString():""}</span>\n' +
        '                  <button type="button" onClick={function(){ deleteChat(c.id); }} style={{background:"transparent",border:"none",color:"#ff6b6b",cursor:"pointer",fontSize:12}}>apagar</button>\n' +
        '                </div>\n' +
        '              </div>\n' +
        '            ); })}\n' +
        '          </div>\n' +
        '        </div>\n' +
        '      )}\n' +
        '      {showConnectors && (\n' +
        '        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:90,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={function(){setShowConnectors(false);}}>\n' +
        '          <div style={{background:"#1a2035",border:"1px solid #3A4566",borderRadius:16,padding:16,width:"100%",maxWidth:420,maxHeight:"80vh",overflowY:"auto"}} onClick={function(e){e.stopPropagation();}}>\n' +
        '            <p style={{margin:"0 0 8px",color:"#F2B705",fontWeight:700}}>Conectores</p>\n' +
        '            {connLoading && <p style={{color:"#9AA3B8"}}>Carregando...</p>}\n' +
        '            {connMsg ? <p style={{color:"#F2B705",fontSize:11,wordBreak:"break-all"}}>{connMsg}</p> : null}\n' +
        '            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>\n' +
        '              {(connectors||[]).slice(0,40).map(function(c,idx){ var slug=c.slug||c.name||("x"+idx); var ok=!!c.connected_account; return (\n' +
        '                <button key={slug+idx} type="button" onClick={function(){ connectOne(slug); }} style={{textAlign:"left",padding:10,borderRadius:12,border:"1px solid #2A3148",background:ok?"#1a3a2a":"#0F1320",color:"#E8ECF5",cursor:"pointer",fontSize:12}}>\n' +
        '                  <div style={{fontWeight:600}}>{c.name||slug}</div>\n' +
        '                  <div style={{color:ok?"#6ee7b7":"#9AA3B8",fontSize:11}}>{ok?"conectado":"conectar"}</div>\n' +
        '                </button>\n' +
        '              ); })}\n' +
        '            </div>\n' +
        '            <button type="button" onClick={loadConnectors} style={{marginTop:12,width:"100%",padding:10,borderRadius:8,border:"1px solid #3A4566",background:"#0F1320",color:"#fff",cursor:"pointer"}}>Atualizar</button>\n' +
        '          </div>\n' +
        '        </div>\n' +
        '      )}\n' +
        "      ";
      html = html.replace("{showSettings && (", mod + "{showSettings && (");
    }

    if (html.indexOf('id="cria-file-input"') < 0 && html.indexOf("🖥") >= 0) {
      var fu =
        '<input id="cria-file-input" type="file" accept="image/*,.txt,.md,.csv,.json,.log,text/*" style={{display:"none"}} onChange={onPickFile} />\n' +
        '        <button type="button" onClick={function(){ var el=document.getElementById("cria-file-input"); if(el) el.click(); }} style={styles.screenBtn} title={pendingFile ? pendingFile.name : "Arquivo"}>📎</button>\n' +
        '        {pendingFile ? <button type="button" onClick={function(){ setPendingFile(null); }} style={{background:"transparent",border:"none",color:"#F2B705",fontSize:11,cursor:"pointer"}}>{String(pendingFile.name||"arq").slice(0,10)} x</button> : null}\n        ';
      html = html.replace(/<input[^>]*data-cria-file="1"[^>]*>\s*/g, "");
      if (html.indexOf(">\n          🖥\n        </button>\n        <input") >= 0) {
        html = html.replace(">\n          🖥\n        </button>\n        <input", ">\n          🖥\n        </button>\n        " + fu + "<input");
      }
    }

    html = html.replace(/disabled=\{loading \|\| !input\.trim\(\)\}/g, 'disabled={loading || (!input.trim() && !(pendingFile && pendingFile.kind === "image"))}');
  } catch (e) {
    console.warn("CRIA_PATCH_CHAT_PLUS error", e);
  }
  return html;
};

window.CRIA_PATCH_CHAT_PLUS_FIX = function(html) {
  try {
    html = html.replace(
      /onSend=\{sendMessage\} scrollRef=\{scrollRef\}[^/]*\/>/,
      'onSend={sendMessage} scrollRef={scrollRef} voiceGender={typeof voiceGender!=="undefined"?voiceGender:"feminina"} elevenKey={typeof elevenKey!=="undefined"?elevenKey:""} elevenVoiceId={typeof elevenVoiceId!=="undefined"?elevenVoiceId:""} pendingFile={pendingFile} setPendingFile={setPendingFile} onPickFile={onPickFile} />'
    );
    html = html.replace(/function ChatView\(\{([^}]+)\}\)/, function (_, props) {
      var p = props;
      if (p.indexOf("pendingFile") < 0) p += ", pendingFile, setPendingFile, onPickFile";
      if (p.indexOf("voiceGender") < 0) p += ", voiceGender, elevenKey, elevenVoiceId";
      return "function ChatView({" + p + "})";
    });
  } catch (e) {
    console.warn("CHAT_PLUS_FIX", e);
  }
  return html;
};
