window.CRIA_PATCH_COMPOSIO = function(html) {
  try {
    // remove versão antiga se existir no html (marca nova)
    if (html.indexOf('CRIA_COMPOSIO_V2') >= 0) return html;

    var defaultKeyExpr = '(function(){try{var d=typeof atob==="function"?atob("YWtfTWVIOUtCcnM2VFoxb2d2NnMtS1Q="):"";var s=loadLocal("cria_composio_key","");return s||d;}catch(e){return"";}})()';

    // Estado
    if (html.indexOf('composioKey') < 0) {
      html = html.replace(
        'const [voiceGender, setVoiceGender] = useState(() => loadLocal("cria_voice_gender", "feminina"));',
        'const [voiceGender, setVoiceGender] = useState(() => loadLocal("cria_voice_gender", "feminina"));\n  const [composioKey, setComposioKey] = useState(function(){ return ' + defaultKeyExpr + '; });\n  const [composioOn, setComposioOn] = useState(() => loadLocal("cria_composio_on", "1") === "1");'
      );
      html = html.replace(
        '}, [voiceGender]);',
        '}, [voiceGender]);\n  useEffect(() => { saveLocal("cria_composio_key", composioKey); }, [composioKey]);\n  useEffect(() => { saveLocal("cria_composio_on", composioOn ? "1" : "0"); }, [composioOn]);'
      );
    } else {
      // liga por padrão se ainda estiver desligado no código antigo
      html = html.replace(
        'loadLocal("cria_composio_on", "0") === "1"',
        'loadLocal("cria_composio_on", "1") === "1"'
      );
    }

    // UI settings
    if (html.indexOf('Composio (conectores)') < 0) {
      var block =
        '<p style={styles.settingsLabel}>Composio (~1000 conectores)</p>\n' +
        '          <div style={styles.keyGrid}>\n' +
        '            <div style={styles.keyFieldWrap}>\n' +
        '              <label style={styles.keyLabel}>Chave Composio</label>\n' +
        '              <div style={styles.keyInputRow}>\n' +
        '                <input style={styles.keyInput} type="password" value={composioKey} onChange={(e) => setComposioKey(e.target.value)} placeholder="ak_..." />\n' +
        '              </div>\n' +
        '              <p style={styles.keyHint}>dashboard.composio.dev → API Keys. Use /composio ou /conectar gmail</p>\n' +
        '            </div>\n' +
        '          </div>\n' +
        '          <label style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,fontSize:13,color:"#9AA3B8"}}>\n' +
        '            <input type="checkbox" checked={composioOn} onChange={function(e){ setComposioOn(e.target.checked); }} />\n' +
        '            Ativar Composio (Gmail, GitHub, Slack… sob demanda)\n' +
        '          </label>\n' +
        '          <p style={styles.settingsHint}>';
      if (html.indexOf('<p style={styles.settingsHint}>') >= 0) {
        html = html.replace('<p style={styles.settingsHint}>', block);
      }
    }

    // Funções V2 — substitui bloco antigo se presente
    var composioFns =
      '  /* CRIA_COMPOSIO_V2 */\n' +
      '  async function composioRequest(path, method, body) {\n' +
      '    var key = (composioKey || "").trim();\n' +
      '    if (!key) throw new Error("Configure a chave Composio nas Configurações.");\n' +
      '    var res = await fetch("https://backend.composio.dev" + path, {\n' +
      '      method: method || "GET",\n' +
      '      headers: { "x-api-key": key, "Content-Type": "application/json", "Accept": "application/json" },\n' +
      '      body: body ? JSON.stringify(body) : undefined\n' +
      '    });\n' +
      '    var data = null;\n' +
      '    try { data = await res.json(); } catch(e) { data = {}; }\n' +
      '    if (!res.ok) {\n' +
      '      var msg = (data && (data.message || data.error || data.detail || data.error_description)) || ("HTTP " + res.status);\n' +
      '      if (typeof msg !== "string") msg = JSON.stringify(msg);\n' +
      '      var err = new Error(msg);\n' +
      '      err.status = res.status;\n' +
      '      err.data = data;\n' +
      '      throw err;\n' +
      '    }\n' +
      '    return data;\n' +
      '  }\n' +
      '  function composioClearSession(uid) {\n' +
      '    try { localStorage.removeItem("cria_composio_session_" + (uid || "eu")); } catch(e) {}\n' +
      '  }\n' +
      '  async function composioEnsureSession(uid, forceNew) {\n' +
      '    var cacheKey = "cria_composio_session_" + (uid || "eu");\n' +
      '    if (!forceNew) {\n' +
      '      try {\n' +
      '        var cached = localStorage.getItem(cacheKey);\n' +
      '        if (cached) return cached;\n' +
      '      } catch(e) {}\n' +
      '    } else {\n' +
      '      composioClearSession(uid);\n' +
      '    }\n' +
      '    var data = await composioRequest("/api/v3.1/tool_router/session", "POST", {\n' +
      '      user_id: String(uid || "eu"),\n' +
      '      manage_connections: { enabled: true }\n' +
      '    });\n' +
      '    var sid = data.session_id || data.id;\n' +
      '    if (!sid) throw new Error("Falha ao criar sessão Composio: " + JSON.stringify(data).slice(0, 200));\n' +
      '    try { localStorage.setItem(cacheKey, sid); } catch(e) {}\n' +
      '    return sid;\n' +
      '  }\n' +
      '  function composioDetectToolkit(text) {\n' +
      '    var t = String(text || "").toLowerCase();\n' +
      '    var map = [\n' +
      '      [/gmail|e-?mail|email|correio/, "gmail"],\n' +
      '      [/github|git hub|reposit[oó]rio|issue|pull request|\\bpr\\b/, "github"],\n' +
      '      [/slack/, "slack"],\n' +
      '      [/notion/, "notion"],\n' +
      '      [/discord/, "discord"],\n' +
      '      [/twitter|\\bx\\b|tweet/, "twitter"],\n' +
      '      [/youtube/, "youtube"],\n' +
      '      [/drive|google drive/, "googledrive"],\n' +
      '      [/calendar|agenda google/, "googlecalendar"],\n' +
      '      [/sheets|planilha/, "googlesheets"],\n' +
      '      [/trello/, "trello"],\n' +
      '      [/linear/, "linear"],\n' +
      '      [/jira/, "jira"],\n' +
      '      [/whatsapp/, "whatsapp"],\n' +
      '      [/telegram/, "telegram"],\n' +
      '      [/spotify/, "spotify"],\n' +
      '      [/outlook/, "outlook"]\n' +
      '    ];\n' +
      '    for (var i = 0; i < map.length; i++) {\n' +
      '      if (map[i][0].test(t)) return map[i][1];\n' +
      '    }\n' +
      '    var m = t.match(/conectar\\s+([a-z0-9_]+)/i) || t.match(/link\\s+([a-z0-9_]+)/i);\n' +
      '    if (m) return m[1].toLowerCase();\n' +
      '    return null;\n' +
      '  }\n' +
      '  async function composioConnectToolkit(sid, toolkit) {\n' +
      '    // 1) manage connections\n' +
      '    try {\n' +
      '      var man = await composioRequest("/api/v3.1/tool_router/session/" + sid + "/execute", "POST", {\n' +
      '        tool_slug: "COMPOSIO_MANAGE_CONNECTIONS",\n' +
      '        arguments: { toolkits: [toolkit] }\n' +
      '      });\n' +
      '      var results = (man.data && man.data.results) || {};\n' +
      '      var info = results[toolkit] || results[Object.keys(results)[0]];\n' +
      '      if (info && info.redirect_url) {\n' +
      '        return { url: info.redirect_url, instruction: info.instruction || "", status: info.status || "initiated" };\n' +
      '      }\n' +
      '      if (info && (info.status === "active" || info.status === "ACTIVE")) {\n' +
      '        return { url: null, status: "active", instruction: toolkit + " já conectado." };\n' +
      '      }\n' +
      '    } catch (e) {}\n' +
      '    // 2) link endpoint\n' +
      '    var link = await composioRequest("/api/v3.1/tool_router/session/" + sid + "/link", "POST", { toolkit: toolkit });\n' +
      '    return {\n' +
      '      url: link.redirect_url || link.url,\n' +
      '      status: "initiated",\n' +
      '      instruction: "Abra o link para autorizar " + toolkit + " (vale ~10 min)."\n' +
      '    };\n' +
      '  }\n' +
      '  async function composioRunForMessage(userText, uid) {\n' +
      '    var force = /nova sess[aã]o|reset composio|reiniciar composio/i.test(userText);\n' +
      '    var sid;\n' +
      '    try {\n' +
      '      sid = await composioEnsureSession(uid, force);\n' +
      '    } catch (e) {\n' +
      '      composioClearSession(uid);\n' +
      '      sid = await composioEnsureSession(uid, true);\n' +
      '    }\n' +
      '    var lines = [];\n' +
      '    var toolkit = composioDetectToolkit(userText);\n' +
      '    var wantLink = /\\b(conectar|connect|login|autorizar|link|auth)\\b/i.test(userText) || /^\\/conectar/i.test(userText.trim());\n' +
      '\n' +
      '    // Conectar app\n' +
      '    if (wantLink && toolkit) {\n' +
      '      try {\n' +
      '        var conn = await composioConnectToolkit(sid, toolkit);\n' +
      '        if (conn.status === "active") {\n' +
      '          lines.push("✅ **" + toolkit + "** já está conectado neste user (`" + (uid||"eu") + "`).");\n' +
      '        } else if (conn.url) {\n' +
      '          lines.push("🔐 **Login / autorização: " + toolkit + "**");\n' +
      '          lines.push("Abra este link (expira em ~10 min):");\n' +
      '          lines.push("[Conectar " + toolkit + "](" + conn.url + ")");\n' +
      '          lines.push(conn.url);\n' +
      '          lines.push("\\nDepois de autorizar no navegador, volte e peça de novo a ação.");\n' +
      '        } else {\n' +
      '          lines.push("Não consegui gerar link de login para " + toolkit + ".");\n' +
      '        }\n' +
      '        return lines.join("\\n");\n' +
      '      } catch (e) {\n' +
      '        // sessão inválida → recria\n' +
      '        composioClearSession(uid);\n' +
      '        sid = await composioEnsureSession(uid, true);\n' +
      '        try {\n' +
      '          var conn2 = await composioConnectToolkit(sid, toolkit);\n' +
      '          if (conn2.url) {\n' +
      '            lines.push("🔐 **Login: " + toolkit + "**");\n' +
      '            lines.push("[Conectar " + toolkit + "](" + conn2.url + ")");\n' +
      '            lines.push(conn2.url);\n' +
      '            return lines.join("\\n");\n' +
      '          }\n' +
      '        } catch (e2) {\n' +
      '          return "Bug de login corrigido parcialmente, mas falhou: " + (e2.message || e2);\n' +
      '        }\n' +
      '        return "Falha no login Composio: " + (e.message || e);\n' +
      '      }\n' +
      '    }\n' +
      '\n' +
      '    // Busca no catálogo (~1000+) via meta tool\n' +
      '    var searchData = null;\n' +
      '    try {\n' +
      '      var exec = await composioRequest("/api/v3.1/tool_router/session/" + sid + "/execute", "POST", {\n' +
      '        tool_slug: "COMPOSIO_SEARCH_TOOLS",\n' +
      '        arguments: { queries: [{ use_case: String(userText).slice(0, 400) }] }\n' +
      '      });\n' +
      '      searchData = exec.data || exec;\n' +
      '    } catch (e) {\n' +
      '      if (e.status === 404 || /session/i.test(String(e.message))) {\n' +
      '        composioClearSession(uid);\n' +
      '        sid = await composioEnsureSession(uid, true);\n' +
      '        var exec2 = await composioRequest("/api/v3.1/tool_router/session/" + sid + "/execute", "POST", {\n' +
      '          tool_slug: "COMPOSIO_SEARCH_TOOLS",\n' +
      '          arguments: { queries: [{ use_case: String(userText).slice(0, 400) }] }\n' +
      '        });\n' +
      '        searchData = exec2.data || exec2;\n' +
      '      } else {\n' +
      '        lines.push("Busca: " + (e.message || e));\n' +
      '      }\n' +
      '    }\n' +
      '\n' +
      '    lines.push("🔍 **Composio** — catálogo de conectores (1000+)");\n' +
      '    if (searchData) {\n' +
      '      var results = searchData.results || [];\n' +
      '      if (!Array.isArray(results)) results = [];\n' +
      '      if (!results.length) {\n' +
      '        lines.push("```\n" + JSON.stringify(searchData, null, 2).slice(0, 1800) + "\n```");\n' +
      '      }\n' +
      '      for (var ri = 0; ri < Math.min(results.length, 3); ri++) {\n' +
      '        var r = results[ri];\n' +
      '        lines.push("\\n**Caso:** " + (r.use_case || userText).slice(0, 80));\n' +
      '        var steps = r.recommended_plan_steps || r.plan || [];\n' +
      '        if (Array.isArray(steps)) {\n' +
      '          for (var si = 0; si < Math.min(steps.length, 6); si++) lines.push((si + 1) + ". " + String(steps[si]).slice(0, 200));\n' +
      '        }\n' +
      '        var tools = r.tools || r.tool_slugs || r.primary_tool_slugs || [];\n' +
      '        if (typeof tools === "string") tools = [tools];\n' +
      '        if (Array.isArray(tools) && tools.length) {\n' +
      '          lines.push("Tools: `" + tools.slice(0, 8).join("` · `") + "`");\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '\n' +
      '    // Se detectou toolkit e não está conectando explicitamente, oferece link de login\n' +
      '    if (toolkit && !wantLink) {\n' +
      '      try {\n' +
      '        var tks = await composioRequest("/api/v3.1/tool_router/session/" + sid + "/toolkits", "GET");\n' +
      '        var items = tks.items || tks.toolkits || [];\n' +
      '        var found = null;\n' +
      '        for (var ti = 0; ti < items.length; ti++) {\n' +
      '          if ((items[ti].slug || "").toLowerCase() === toolkit) { found = items[ti]; break; }\n' +
      '        }\n' +
      '        var connected = found && found.connected_account;\n' +
      '        if (!connected) {\n' +
      '          var c3 = await composioConnectToolkit(sid, toolkit);\n' +
      '          if (c3.url) {\n' +
      '            lines.push("\\n🔐 **" + toolkit + " ainda não autorizado**");\n' +
      '            lines.push("[Fazer login / conectar " + toolkit + "](" + c3.url + ")");\n' +
      '            lines.push(c3.url);\n' +
      '          }\n' +
      '        } else {\n' +
      '          lines.push("\\n✅ " + toolkit + " conectado.");\n' +
      '        }\n' +
      '      } catch (e) {\n' +
      '        lines.push("\\n(Status da conexão: " + (e.message || e) + ")");\n' +
      '      }\n' +
      '    }\n' +
      '\n' +
      '    lines.push("\\n—");\n' +
      '    lines.push("Comandos: `/composio …` · `/conectar gmail` · `/conectar github` · `reset composio`");\n' +
      '    lines.push("Sessão `" + sid + "` · user `" + (uid || "eu") + "`");\n' +
      '    return lines.join("\\n");\n' +
      '  }\n' +
      '  ';

    // Remove funções V1 se existirem e injeta V2
    if (html.indexOf('CRIA_COMPOSIO_V1') >= 0) {
      html = html.replace(/\/\* CRIA_COMPOSIO_V1 \*\/[\s\S]*?(?=async function sendMessage)/, composioFns);
    } else if (html.indexOf('CRIA_COMPOSIO_V2') < 0 && html.indexOf('async function sendMessage') >= 0) {
      html = html.replace('async function sendMessage', composioFns + 'async function sendMessage');
    }

    // Intercept sendMessage
    var composioIntercept =
      'setLoading(true);\n\n' +
      '    try {\n' +
      '      var _ct = (text || "").trim();\n' +
      '      var _wantComposio = composioOn || /^\\/composio\\b/i.test(_ct) || /^\\/conectar\\b/i.test(_ct) || /^composio[:\\s]/i.test(_ct);\n' +
      '      if (_wantComposio && (composioKey || "").trim()) {\n' +
      '        var _q = _ct.replace(/^\\/composio\\s*/i, "").replace(/^composio[:\\s]+/i, "").trim() || _ct;\n' +
      '        var _uid = (typeof userId !== "undefined" && userId) ? userId : "eu";\n' +
      '        try {\n' +
      '          var _compOut = await composioRunForMessage(_q, _uid);\n' +
      '          var _hist = nextMessages.concat([{ role: "assistant", text: "[Composio]\\n" + _compOut }, { role: "user", text: "Com base no resultado Composio acima, explique em português de forma curta e prática. Se houver link de login, diga pra pessoa abrir. Pedido: " + _q }]);\n' +
      '          var _ai = "";\n' +
      '          try { _ai = await askCria(_hist, { voice: false, image: null }); } catch(e) { _ai = ""; }\n' +
      '          var _final = (_compOut || "") + (_ai ? ("\\n\\n---\\n" + _ai) : "");\n' +
      '          setMessages(nextMessages.concat([{ role: "assistant", text: _final }]));\n' +
      '          setLoading(false);\n' +
      '          return;\n' +
      '        } catch (ce) {\n' +
      '          setMessages(nextMessages.concat([{ role: "assistant", text: "Composio: " + (ce.message || ce) + "\\n\\nTenta: reset composio  ou /conectar gmail" }]));\n' +
      '          setLoading(false);\n' +
      '          return;\n' +
      '        }\n' +
      '      }\n' +
      '      // --- Cria Editor:';

    if (html.indexOf('// --- Cria Editor:') >= 0) {
      // pode já ter intercept antigo — substitui bloco inteiro do try até Editor
      html = html.replace(
        /setLoading\(true\);\n\n    try \{\n      var _ct[\s\S]*?\/\/ --- Cria Editor:/,
        composioIntercept
      );
      if (html.indexOf('_wantComposio') < 0) {
        html = html.replace(
          'setLoading(true);\n\n    try {\n      // --- Cria Editor:',
          composioIntercept
        );
      }
    } else if (html.indexOf('setLoading(true);\n\n    try {\n      const replyText = await askCria') >= 0) {
      html = html.replace(
        'setLoading(true);\n\n    try {\n      const replyText = await askCria',
        composioIntercept.replace('// --- Cria Editor:', 'const replyText = await askCria')
      );
    }

  } catch (e) {
    console.warn('CRIA_PATCH_COMPOSIO error', e);
  }
  return html;
};
