window.CRIA_PATCH_CHAT_PLUS = function(html) {
  try {
    if (html.indexOf('CRIA_CHAT_PLUS_V1') >= 0) return html;

    // ========== 1) STATE: login, chats, panels, pending file ==========
    var stateInject =
      '  /* CRIA_CHAT_PLUS_V1 */\n' +
      '  const [showLogin, setShowLogin] = useState(false);\n' +
      '  const [showHistory, setShowHistory] = useState(false);\n' +
      '  const [showConnectors, setShowConnectors] = useState(false);\n' +
      '  const [loginName, setLoginName] = useState("");\n' +
      '  const [loginPin, setLoginPin] = useState("");\n' +
      '  const [loginError, setLoginError] = useState("");\n' +
      '  const [chatList, setChatList] = useState(function(){ return []; });\n' +
      '  const [chatId, setChatId] = useState(function(){ try { return localStorage.getItem("cria_chat_id_"+(localStorage.getItem("cria_user_id")||"eu")) || ""; } catch(e){ return ""; } });\n' +
      '  const [pendingFile, setPendingFile] = useState(null);\n' +
      '  const [connectors, setConnectors] = useState([]);\n' +
      '  const [connLoading, setConnLoading] = useState(false);\n' +
      '  const [connMsg, setConnMsg] = useState("");\n' +
      '  const fileInputRef = useRef(null);\n';

    if (html.indexOf('CRIA_CHAT_PLUS_V1') < 0) {
      // after voiceGender state line (may already have composio)
      if (html.indexOf('const [composioKey') >= 0) {
        html = html.replace(
          /const \[composioOn, setComposioOn\] = useState\([^;]+\);/,
          function(m){ return m + '\n' + stateInject; }
        );
      } else {
        html = html.replace(
          'const [voiceGender, setVoiceGender] = useState(() => loadLocal("cria_voice_gender", "feminina"));',
          'const [voiceGender, setVoiceGender] = useState(() => loadLocal("cria_voice_gender", "feminina"));\n' + stateInject
        );
      }
    }

    // ========== 2) Helper functions before sendMessage ==========
    var helpers =
      '  function chatsKey(uid){ return "cria_chats_v1_" + (uid||"eu"); }\n' +
      '  function loadChatList(uid){ try { var a=JSON.parse(localStorage.getItem(chatsKey(uid))||"[]"); return Array.isArray(a)?a:[]; } catch(e){ return []; } }\n' +
      '  function saveChatList(uid, list){ try { localStorage.setItem(chatsKey(uid), JSON.stringify(list||[])); } catch(e){} }\n' +
      '  function refreshChatList(){ var uid=(typeof userId!=="undefined"&&userId)?userId:"eu"; setChatList(loadChatList(uid)); }\n' +
      '  function persistCurrentChat(){\n' +
      '    var uid=(typeof userId!=="undefined"&&userId)?userId:"eu";\n' +
      '    var list=loadChatList(uid);\n' +
      '    var id=chatId;\n' +
      '    if(!id){ id="c_"+Date.now(); setChatId(id); try{localStorage.setItem("cria_chat_id_"+uid,id);}catch(e){} }\n' +
      '    var title="Nova conversa";\n' +
      '    for(var i=0;i<(messages||[]).length;i++){ if(messages[i].role==="user"&&messages[i].text){ title=String(messages[i].text).slice(0,42); break; } }\n' +
      '    var found=false;\n' +
      '    for(var j=0;j<list.length;j++){ if(list[j].id===id){ list[j]={id:id,title:title,updated:Date.now(),messages:messages}; found=true; break; } }\n' +
      '    if(!found) list.unshift({id:id,title:title,updated:Date.now(),messages:messages});\n' +
      '    list.sort(function(a,b){ return (b.updated||0)-(a.updated||0); });\n' +
      '    if(list.length>40) list=list.slice(0,40);\n' +
      '    saveChatList(uid,list);\n' +
      '    setChatList(list);\n' +
      '  }\n' +
      '  function openChat(id){\n' +
      '    var uid=(typeof userId!=="undefined"&&userId)?userId:"eu";\n' +
      '    var list=loadChatList(uid);\n' +
      '    for(var i=0;i<list.length;i++){\n' +
      '      if(list[i].id===id){\n' +
      '        setChatId(id);\n' +
      '        try{localStorage.setItem("cria_chat_id_"+uid,id);}catch(e){}\n' +
      '        setMessages(list[i].messages&&list[i].messages.length?list[i].messages:[{role:"assistant",text:"Oi! Continuando essa conversa."}]);\n' +
      '        setShowHistory(false);\n' +
      '        setInput("");\n' +
      '        setPendingFile(null);\n' +
      '        return;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  function deleteChat(id){\n' +
      '    var uid=(typeof userId!=="undefined"&&userId)?userId:"eu";\n' +
      '    var list=loadChatList(uid).filter(function(c){ return c.id!==id; });\n' +
      '    saveChatList(uid,list);\n' +
      '    setChatList(list);\n' +
      '    if(chatId===id){\n' +
      '      setChatId("");\n' +
      '      try{localStorage.removeItem("cria_chat_id_"+uid);}catch(e){}\n' +
      '      if(typeof startNewChat==="function") startNewChat();\n' +
      '      else setMessages([{role:"assistant",text:"Oi! Nova conversa."}]);\n' +
      '    }\n' +
      '  }\n' +
      '  function doLogin(){\n' +
      '    setLoginError("");\n' +
      '    var name=String(loginName||"").trim().toLowerCase().replace(/[^a-z0-9_\-]/g,"").slice(0,24);\n' +
      '    if(!name){ setLoginError("Digite um nome de usuário"); return; }\n' +
      '    var pin=String(loginPin||"");\n' +
      '    var storeKey="cria_pin_"+name;\n' +
      '    try {\n' +
      '      var saved=localStorage.getItem(storeKey);\n' +
      '      if(saved){\n' +
      '        if(saved!==pin){ setLoginError("PIN incorreto"); return; }\n' +
      '      } else {\n' +
      '        if(pin) localStorage.setItem(storeKey, pin);\n' +
      '      }\n' +
      '      // troca usuário\n' +
      '      if(typeof switchUser==="function") switchUser(name);\n' +
      '      else if(typeof setUserId==="function"){ setUserId(name); try{localStorage.setItem("cria_user_id",name);}catch(e){} }\n' +
      '      setShowLogin(false);\n' +
      '      setLoginPin("");\n' +
      '      setTimeout(function(){ refreshChatList(); }, 50);\n' +
      '    } catch(e){ setLoginError(String(e.message||e)); }\n' +
      '  }\n' +
      '  function doLogout(){\n' +
      '    if(typeof switchUser==="function") switchUser("eu");\n' +
      '    else if(typeof setUserId==="function"){ setUserId("eu"); }\n' +
      '    setShowLogin(false);\n' +
      '  }\n' +
      '  async function loadConnectors(){\n' +
      '    setConnLoading(true); setConnMsg(""); setConnectors([]);\n' +
      '    try {\n' +
      '      if(typeof composioEnsureSession!=="function" || typeof composioRequest!=="function"){\n' +
      '        setConnMsg("Composio não carregou. Coloque a chave nas Configurações.");\n' +
      '        setConnLoading(false); return;\n' +
      '      }\n' +
      '      var uid=(typeof userId!=="undefined"&&userId)?userId:"eu";\n' +
      '      var sid=await composioEnsureSession(uid, false);\n' +
      '      var data=await composioRequest("/api/v3.1/tool_router/session/"+sid+"/toolkits","GET");\n' +
      '      var items=data.items||data.toolkits||[];\n' +
      '      if(!items.length){\n' +
      '        // fallback lista popular\n' +
      '        items=["gmail","github","slack","notion","googlecalendar","googledrive","discord","trello","linear","youtube","spotify","twitter"].map(function(s){return {slug:s,name:s,connected_account:null};});\n' +
      '      }\n' +
      '      setConnectors(items);\n' +
      '    } catch(e){\n' +
      '      setConnMsg("Erro: "+(e.message||e));\n' +
      '    }\n' +
      '    setConnLoading(false);\n' +
      '  }\n' +
      '  async function connectOne(slug){\n' +
      '    setConnMsg("Gerando link de login…");\n' +
      '    try {\n' +
      '      var uid=(typeof userId!=="undefined"&&userId)?userId:"eu";\n' +
      '      var sid=await composioEnsureSession(uid, false);\n' +
      '      var conn=await composioConnectToolkit(sid, slug);\n' +
      '      if(conn&&conn.url){\n' +
      '        setConnMsg("Abra o link para autorizar "+slug+": "+conn.url);\n' +
      '        try { window.open(conn.url, "_blank"); } catch(e){}\n' +
      '      } else if(conn&&conn.status==="active"){\n' +
      '        setConnMsg(slug+" já conectado!");\n' +
      '        loadConnectors();\n' +
      '      } else setConnMsg("Sem link para "+slug);\n' +
      '    } catch(e){ setConnMsg(e.message||String(e)); }\n' +
      '  }\n' +
      '  function onPickFile(ev){\n' +
      '    var f=ev.target.files&&ev.target.files[0];\n' +
      '    if(!f) return;\n' +
      '    var max=12*1024*1024;\n' +
      '    if(f.size>max){ alert("Arquivo grande demais (máx 12MB)"); ev.target.value=""; return; }\n' +
      '    var reader=new FileReader();\n' +
      '    var isImg=/^image\//.test(f.type);\n' +
      '    var isText=/^text\//.test(f.type)||/\.(txt|md|csv|json|log)$/i.test(f.name);\n' +
      '    reader.onload=function(){\n' +
      '      try {\n' +
      '        if(isImg){\n' +
      '          var dataUrl=String(reader.result||"");\n' +
      '          var m=dataUrl.match(/^data:([^;]+);base64,(.+)$/);\n' +
      '          if(!m){ alert("Não consegui ler a imagem"); return; }\n' +
      '          setPendingFile({ kind:"image", name:f.name, mime:m[1], data:m[2] });\n' +
      '        } else if(isText){\n' +
      '          setPendingFile({ kind:"text", name:f.name, text:String(reader.result||"").slice(0,80000) });\n' +
      '        } else {\n' +
      '          // outros: manda como base64 genérico + aviso\n' +
      '          var dataUrl2=String(reader.result||"");\n' +
      '          var m2=dataUrl2.match(/^data:([^;]+);base64,(.+)$/);\n' +
      '          if(m2&&/^image\//.test(m2[1])){\n' +
      '            setPendingFile({ kind:"image", name:f.name, mime:m2[1], data:m2[2] });\n' +
      '          } else {\n' +
      '            setPendingFile({ kind:"meta", name:f.name, mime:f.type||"application/octet-stream", size:f.size });\n' +
      '          }\n' +
      '        }\n' +
      '      } catch(e){ alert("Erro ao ler arquivo: "+e.message); }\n' +
      '    };\n' +
      '    if(isImg) reader.readAsDataURL(f);\n' +
      '    else if(isText) reader.readAsText(f);\n' +
      '    else reader.readAsDataURL(f);\n' +
      '    ev.target.value="";\n' +
      '  }\n' +
      '  useEffect(function(){ refreshChatList(); }, [userId]);\n' +
      '  useEffect(function(){ try { persistCurrentChat(); } catch(e){} }, [messages, chatId, userId]);\n' +
      '  ';

    if (html.indexOf('function chatsKey') < 0 && html.indexOf('async function sendMessage') >= 0) {
      html = html.replace('async function sendMessage', helpers + 'async function sendMessage');
    }

    // ========== 3) sendMessage: aceitar arquivo (forced image + text append) ==========
    // Patch início do sendMessage para incluir pendingFile
    if (html.indexOf('_criaFileHandled') < 0) {
      // after const text = ...
      var oldTextLine = null;
      if (html.indexOf('const text = (forcedText != null') >= 0) {
        html = html.replace(
          'const text = (forcedText != null && String(forcedText).trim() ? String(forcedText) : input).trim();\n    if (!text || loading) return;',
          'var text = (forcedText != null && String(forcedText).trim() ? String(forcedText) : input).trim();\n    var _file = pendingFile;\n    /* _criaFileHandled */\n    if (_file && _file.kind === "text" && _file.text) {\n      text = (text ? text + "\\n\\n" : "") + "[Arquivo: " + _file.name + "]\\n" + _file.text;\n    } else if (_file && _file.kind === "meta") {\n      text = (text ? text + "\\n\\n" : "") + "[Arquivo anexado: " + _file.name + " (" + (_file.mime||"?") + ", " + Math.round((_file.size||0)/1024) + " KB). Não consigo abrir o binário, mas posso orientar pelo nome/tipo.]";\n    }\n    if ((!text && !(_file && _file.kind === "image")) || loading) return;\n    if (!text && _file && _file.kind === "image") text = "Analisa essa imagem e me descreve o que você vê, com detalhes úteis.";'
        );
      } else if (html.indexOf('const text = input.trim();') >= 0) {
        html = html.replace(
          'const text = input.trim();\n    if (!text || loading) return;',
          'var text = input.trim();\n    var _file = pendingFile;\n    if (_file && _file.kind === "text" && _file.text) text = (text ? text + "\\n\\n" : "") + "[Arquivo: " + _file.name + "]\\n" + _file.text;\n    else if (_file && _file.kind === "meta") text = (text ? text + "\\n\\n" : "") + "[Arquivo: " + _file.name + "]";\n    if ((!text && !(_file && _file.kind === "image")) || loading) return;\n    if (!text && _file && _file.kind === "image") text = "Analisa essa imagem e me descreve o que você vê.";'
        );
      }

      // after setInput("") clear pending and pass image
      html = html.replace(
        'setMessages(nextMessages);\n    setInput("");\n    setLoading(true);',
        'setMessages(nextMessages);\n    setInput("");\n    setPendingFile(null);\n    setLoading(true);\n    var _imgArg = image || null;\n    if (_file && _file.kind === "image" && _file.data) _imgArg = { mime: _file.mime || "image/jpeg", data: _file.data };'
      );

      // askCria image: image || null -> _imgArg
      html = html.replace(
        /askCria\(nextMessages, \{ voice: false, image: image \|\| null \}\)/g,
        'askCria(nextMessages, { voice: false, image: (typeof _imgArg !== "undefined" ? _imgArg : (image || null)) })'
      );
    }

    // ========== 4) HEADER buttons ==========
    var settingsBtn =
      '<button style={styles.settingsBtn} onClick={() => setShowSettings((v) => !v)} aria-label="Configurações">\n' +
      '          ⚙\n' +
      '        </button>';

    // may already have ＋ 🗑 from history patch
    var headerExtra =
      '<button type="button" style={styles.settingsBtn} onClick={function(){ setShowLogin(true); }} title="Login" aria-label="Login">👤</button>\n' +
      '        <button type="button" style={styles.settingsBtn} onClick={function(){ refreshChatList(); setShowHistory(true); }} title="Histórico" aria-label="Histórico">💬</button>\n' +
      '        <button type="button" style={styles.settingsBtn} onClick={function(){ setShowConnectors(true); loadConnectors(); }} title="Conectores" aria-label="Conectores">🔌</button>\n';

    if (html.indexOf('title="Login"') < 0) {
      if (html.indexOf('startNewChat') >= 0 && html.indexOf('title="Nova conversa"') >= 0) {
        html = html.replace(
          '<button type="button" style={styles.settingsBtn} onClick={startNewChat}',
          headerExtra + '        <button type="button" style={styles.settingsBtn} onClick={startNewChat}'
        );
      } else if (html.indexOf(settingsBtn) >= 0) {
        html = html.replace(settingsBtn, headerExtra + '        ' + settingsBtn);
      } else {
        html = html.replace(
          'aria-label="Configurações"',
          'aria-label="Configurações"'
        );
        // insert before settings
        html = html.replace(
          /<button style=\{styles\.settingsBtn\} onClick=\{\(\) => setShowSettings/,
          headerExtra + '        <button style={styles.settingsBtn} onClick={() => setShowSettings'
        );
      }
    }

    // ========== 5) MODALS after header / before settings panel ==========
    var modals =
      '{showLogin && (\n' +
      '        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={function(){setShowLogin(false);}}>\n' +
      '          <div style={{background:"#1a2035",border:"1px solid #3A4566",borderRadius:16,padding:20,width:"100%",maxWidth:340}} onClick={function(e){e.stopPropagation();}}>\n' +
      '            <p style={{margin:"0 0 12px",color:"#F2B705",fontWeight:700}}>Login local</p>\n' +
      '            <p style={{margin:"0 0 12px",color:"#9AA3B8",fontSize:12}}>Privado neste aparelho. PIN opcional protege o histórico.</p>\n' +
      '            <input style={{...styles.keyInput,width:"100%",marginBottom:8}} placeholder="usuário (ex: gustavo)" value={loginName} onChange={function(e){setLoginName(e.target.value);}} />\n' +
      '            <input style={{...styles.keyInput,width:"100%",marginBottom:8}} type="password" placeholder="PIN (opcional)" value={loginPin} onChange={function(e){setLoginPin(e.target.value);}} />\n' +
      '            {loginError ? <p style={{color:"#ff6b6b",fontSize:12}}>{loginError}</p> : null}\n' +
      '            <div style={{display:"flex",gap:8,marginTop:8}}>\n' +
      '              <button type="button" style={{...styles.tabBtn,flex:1}} onClick={doLogin}>Entrar</button>\n' +
      '              <button type="button" style={{...styles.tabBtn,flex:1}} onClick={doLogout}>Sair</button>\n' +
      '            </div>\n' +
      '            <p style={{marginTop:10,color:"#9AA3B8",fontSize:11}}>Usuário atual: <b style={{color:"#fff"}}>{typeof userId!=="undefined"?userId:"eu"}</b></p>\n' +
      '          </div>\n' +
      '        </div>\n' +
      '      )}\n' +
      '      {showHistory && (\n' +
      '        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:50,display:"flex",justifyContent:"flex-end"}} onClick={function(){setShowHistory(false);}}>\n' +
      '          <div style={{width:"min(360px,100%)",height:"100%",background:"#121826",borderLeft:"1px solid #3A4566",padding:16,overflowY:"auto"}} onClick={function(e){e.stopPropagation();}}>\n' +
      '            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>\n' +
      '              <p style={{margin:0,color:"#F2B705",fontWeight:700}}>Histórico</p>\n' +
      '              <button type="button" style={styles.tabBtn} onClick={function(){ if(typeof startNewChat==="function") startNewChat(); setChatId(""); setShowHistory(false); }}>Nova</button>\n' +
      '            </div>\n' +
      '            {(chatList||[]).length===0 && <p style={{color:"#9AA3B8",fontSize:13}}>Nenhuma conversa salva ainda.</p>}\n' +
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
      '        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={function(){setShowConnectors(false);}}>\n' +
      '          <div style={{background:"#1a2035",border:"1px solid #3A4566",borderRadius:16,padding:16,width:"100%",maxWidth:420,maxHeight:"80vh",overflowY:"auto"}} onClick={function(e){e.stopPropagation();}}>\n' +
      '            <p style={{margin:"0 0 8px",color:"#F2B705",fontWeight:700}}>Conectores Composio</p>\n' +
      '            <p style={{margin:"0 0 12px",color:"#9AA3B8",fontSize:12}}>Milhares de apps via Composio. Conecte e use no chat com /composio.</p>\n' +
      '            {connLoading && <p style={{color:"#9AA3B8"}}>Carregando…</p>}\n' +
      '            {connMsg ? <p style={{color:"#F2B705",fontSize:12,wordBreak:"break-all"}}>{connMsg}</p> : null}\n' +
      '            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>\n' +
      '              {(connectors||[]).slice(0,40).map(function(c,idx){ var slug=c.slug||c.name||("c"+idx); var ok=!!c.connected_account; return (\n' +
      '                <button key={slug+idx} type="button" onClick={function(){ connectOne(slug); }} style={{textAlign:"left",padding:10,borderRadius:12,border:"1px solid #2A3148",background:ok?"#1a3a2a":"#0F1320",color:"#E8ECF5",cursor:"pointer",fontSize:12}}>\n' +
      '                  <div style={{fontWeight:600}}>{c.name||slug}</div>\n' +
      '                  <div style={{color:ok?"#6ee7b7":"#9AA3B8",fontSize:11}}>{ok?"conectado":"conectar"}</div>\n' +
      '                </button>\n' +
      '              ); })}\n' +
      '            </div>\n' +
      '            <button type="button" style={{...styles.tabBtn,marginTop:12,width:"100%"}} onClick={loadConnectors}>Atualizar lista</button>\n' +
      '          </div>\n' +
      '        </div>\n' +
      '      )}\n';

    if (html.indexOf('showLogin &&') < 0) {
      html = html.replace(
        '{showSettings && (',
        modals + '      {showSettings && ('
      );
    }

    // ========== 6) FILE BUTTON in ChatView form ==========
    // Pass props to ChatView - tricky. Use window callbacks instead for file.
    // Inject file button next to screen button via global handlers set on window each render
    html = html.replace(
      'onSend={sendMessage} scrollRef={scrollRef}',
      'onSend={sendMessage} scrollRef={scrollRef} pendingFile={pendingFile} setPendingFile={setPendingFile} fileInputRef={fileInputRef} onPickFile={onPickFile}'
    );
    // may have more props already
    html = html.replace(
      'onSend={sendMessage} scrollRef={scrollRef} voiceGender={voiceGender} elevenKey={elevenKey} elevenVoiceId={elevenVoiceId} />',
      'onSend={sendMessage} scrollRef={scrollRef} voiceGender={voiceGender} elevenKey={elevenKey} elevenVoiceId={elevenVoiceId} pendingFile={pendingFile} setPendingFile={setPendingFile} fileInputRef={fileInputRef} onPickFile={onPickFile} />'
    );

    // Extend ChatView signature - multiple possible forms after voice/mic patches
    html = html.replace(
      /function ChatView\(\{ messages, loading, input, setInput, onSend, scrollRef([^}]*)\}\)/,
      function(full, rest) {
        if (rest.indexOf('pendingFile') >= 0) return full;
        return 'function ChatView({ messages, loading, input, setInput, onSend, scrollRef' + rest + ', pendingFile, setPendingFile, fileInputRef, onPickFile })';
      }
    );

    // Add file button after screen share button
    if (html.indexOf('data-cria-file') < 0) {
      var screenBtnEnd =
        '        >\n' +
        '          🖥\n' +
        '        </button>\n' +
        '        <input';
      var withFile =
        '        >\n' +
        '          🖥\n' +
        '        </button>\n' +
        '        <input ref={fileInputRef} type="file" accept="image/*,.txt,.md,.csv,.json,.log,text/*" style={{display:"none"}} onChange={onPickFile} data-cria-file="1" />\n' +
        '        <button type="button" onClick={function(){ try { fileInputRef && fileInputRef.current && fileInputRef.current.click(); } catch(e){} }} style={{ ...styles.screenBtn, ...(pendingFile ? styles.screenBtnActive : {}) }} title={pendingFile ? ("Anexo: "+pendingFile.name) : "Enviar arquivo"} aria-label="Arquivo">📎</button>\n' +
        '        {pendingFile ? <span style={{color:"#F2B705",fontSize:11,maxWidth:70,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} onClick={function(){ setPendingFile(null); }} title="Remover">{pendingFile.name}×</span> : null}\n' +
        '        <input';
      if (html.indexOf(screenBtnEnd) >= 0) {
        html = html.replace(screenBtnEnd, withFile);
      } else {
        html = html.replace(
          '>\n          🖥\n        </button>',
          '>\n          🖥\n        </button>\n        <input ref={fileInputRef} type="file" accept="image/*,.txt,.md,.csv,.json,.log,text/*" style={{display:"none"}} onChange={onPickFile} data-cria-file="1" />\n        <button type="button" onClick={function(){ try { fileInputRef && fileInputRef.current && fileInputRef.current.click(); } catch(e){} }} style={styles.screenBtn} title="Enviar arquivo">📎</button>'
        );
      }
    }

    // enable send when only image attached - disable condition
    html = html.replace(
      'disabled={loading || !input.trim()}',
      'disabled={loading || (!input.trim() && !(pendingFile && pendingFile.kind==="image"))}'
    );

  } catch (e) {
    console.warn('CRIA_PATCH_CHAT_PLUS error', e);
  }
  return html;
};
