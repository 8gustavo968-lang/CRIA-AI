window.CRIA_PATCH_COMPOSIO = function(html) {
  try {
    if (html.indexOf('CRIA_COMPOSIO_V1') >= 0) return html;

    // --- Estado da chave Composio ---
    if (html.indexOf('composioKey') < 0) {
      html = html.replace(
        'const [voiceGender, setVoiceGender] = useState(() => loadLocal("cria_voice_gender", "feminina"));',
        'const [voiceGender, setVoiceGender] = useState(() => loadLocal("cria_voice_gender", "feminina"));\n  const [composioKey, setComposioKey] = useState(() => loadLocal("cria_composio_key", ""));\n  const [composioOn, setComposioOn] = useState(() => loadLocal("cria_composio_on", "0") === "1");'
      );
      html = html.replace(
        '}, [voiceGender]);',
        '}, [voiceGender]);\n  useEffect(() => { saveLocal("cria_composio_key", composioKey); }, [composioKey]);\n  useEffect(() => { saveLocal("cria_composio_on", composioOn ? "1" : "0"); }, [composioOn]);'
      );
    }

    // --- UI nas configurações ---
    if (html.indexOf('Composio (conectores)') < 0) {
      var block =
        '<p style={styles.settingsLabel}>Composio (conectores)</p>\n' +
        '          <div style={styles.keyGrid}>\n' +
        '            <div style={styles.keyFieldWrap}>\n' +
        '              <label style={styles.keyLabel}>Chave Composio</label>\n' +
        '              <div style={styles.keyInputRow}>\n' +
        '                <input style={styles.keyInput} type="password" value={composioKey} onChange={(e) => setComposioKey(e.target.value)} placeholder="ak_..." />\n' +
        '              </div>\n' +
        '              <p style={styles.keyHint}>dashboard.composio.dev → Settings → API Keys</p>\n' +
        '            </div>\n' +
        '          </div>\n' +
        '          <label style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,fontSize:13,color:"#9AA3B8"}}>\n' +
        '            <input type="checkbox" checked={composioOn} onChange={function(e){ setComposioOn(e.target.checked); }} />\n' +
        '            Ativar Composio nas respostas (ferramentas / apps)\n' +
        '          </label>\n' +
        '          <p style={styles.settingsHint}>';

      if (html.indexOf('<p style={styles.settingsHint}>') >= 0) {
        html = html.replace('<p style={styles.settingsHint}>', block);
      }
    }

    // --- Funções Composio API ---
    if (html.indexOf('CRIA_COMPOSIO_V1') < 0 && html.indexOf('async function sendMessage') >= 0) {
      var composioFns =
        '  /* CRIA_COMPOSIO_V1 */\n' +
        '  async function composioRequest(path, method, body) {\n' +
        '    var key = (composioKey || "").trim();\n' +
        '    if (!key) throw new Error("Configure a chave Composio nas Configurações.");\n' +
        '    var res = await fetch("https://backend.composio.dev" + path, {\n' +
        '      method: method || "GET",\n' +
        '      headers: { "x-api-key": key, "Content-Type": "application/json" },\n' +
        '      body: body ? JSON.stringify(body) : undefined\n' +
        '    });\n' +
        '    var data = null;\n' +
        '    try { data = await res.json(); } catch(e) { data = { raw: true }; }\n' +
        '    if (!res.ok) {\n' +
        '      var msg = (data && (data.message || data.error || data.detail)) || ("HTTP " + res.status);\n' +
        '      throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));\n' +
        '    }\n' +
        '    return data;\n' +
        '  }\n' +
        '  async function composioEnsureSession(uid) {\n' +
        '    var cacheKey = "cria_composio_session_" + (uid || "eu");\n' +
        '    try {\n' +
        '      var cached = localStorage.getItem(cacheKey);\n' +
        '      if (cached) return cached;\n' +
        '    } catch(e) {}\n' +
        '    var data = await composioRequest("/api/v3.1/tool_router/session", "POST", { user_id: String(uid || "eu") });\n' +
        '    var sid = data.session_id || data.id || (data.session && data.session.id);\n' +
        '    if (!sid) throw new Error("Não consegui criar sessão Composio.");\n' +
        '    try { localStorage.setItem(cacheKey, sid); } catch(e) {}\n' +
        '    return sid;\n' +
        '  }\n' +
        '  async function composioRunForMessage(userText, uid) {\n' +
        '    var sid = await composioEnsureSession(uid);\n' +
        '    var lines = [];\n' +
        '    // 1) busca ferramentas relevantes\n' +
        '    try {\n' +
        '      var search = await composioRequest("/api/v3.1/tool_router/session/" + sid + "/search", "POST", {\n' +
        '        queries: [{ use_case: String(userText).slice(0, 500) }]\n' +
        '      });\n' +
        '      lines.push("🔍 Composio — ferramentas encontradas:");\n' +
        '      var items = search.items || search.tools || search.results || search.data || [];\n' +
        '      if (!Array.isArray(items)) items = [];\n' +
        '      if (!items.length && search) lines.push("```\n" + JSON.stringify(search, null, 2).slice(0, 1500) + "\n```");\n' +
        '      for (var i = 0; i < Math.min(items.length, 8); i++) {\n' +
        '        var it = items[i];\n' +
        '        var slug = it.slug || it.tool_slug || it.name || "?";\n' +
        '        var desc = it.description || it.use_case || "";\n' +
        '        lines.push("- **" + slug + "** " + String(desc).slice(0, 120));\n' +
        '      }\n' +
        '    } catch (e) {\n' +
        '      lines.push("Busca de tools: " + (e.message || e));\n' +
        '    }\n' +
        '    // 2) tenta meta execute COMPOSIO_SEARCH_TOOLS se existir\n' +
        '    try {\n' +
        '      var exec = await composioRequest("/api/v3.1/tool_router/session/" + sid + "/execute", "POST", {\n' +
        '        tool_slug: "COMPOSIO_SEARCH_TOOLS",\n' +
        '        arguments: { queries: [{ use_case: String(userText).slice(0, 400) }] }\n' +
        '      });\n' +
        '      lines.push("\\n⚙️ Resultado da execução:");\n' +
        '      lines.push("```\n" + JSON.stringify(exec, null, 2).slice(0, 2500) + "\n```");\n' +
        '    } catch (e) {\n' +
        '      lines.push("\\n(Execução direta: " + (e.message || e) + ")");\n' +
        '      lines.push("Dica: no dashboard da Composio, conecte os apps (Gmail, GitHub, etc.) na conta do user_id **" + (uid || "eu") + "**.");\n' +
        '    }\n' +
        '    lines.push("\\nSessão: `" + sid + "` · user: `" + (uid || "eu") + "`");\n' +
        '    return lines.join("\\n");\n' +
        '  }\n' +
        '  ';

      html = html.replace('async function sendMessage', composioFns + 'async function sendMessage');
    }

    // --- Hook no sendMessage: se composioOn ou /composio ---
    // intercepta no início do try, após setLoading
    var injectMarker = 'setLoading(true);\n\n    try {\n      // --- Cria Editor:';
    var injectMarker2 = 'setLoading(true);\n\n    try {\n      const replyText = await askCria';

    var composioIntercept =
      'setLoading(true);\n\n' +
      '    try {\n' +
      '      var _ct = (text || "").trim();\n' +
      '      var _wantComposio = composioOn || /^\\/composio\\b/i.test(_ct) || /^composio[:\\s]/i.test(_ct);\n' +
      '      if (_wantComposio && (composioKey || "").trim()) {\n' +
      '        var _q = _ct.replace(/^\\/composio\\s*/i, "").replace(/^composio[:\\s]+/i, "").trim() || _ct;\n' +
      '        var _uid = (typeof userId !== "undefined" && userId) ? userId : "eu";\n' +
      '        try {\n' +
      '          var _compOut = await composioRunForMessage(_q, _uid);\n' +
      '          // também pede à IA interpretar o resultado\n' +
      '          var _hist = nextMessages.concat([{ role: "assistant", text: "[Composio]\\n" + _compOut }, { role: "user", text: "Com base no resultado Composio acima, responda de forma útil e curta em português o que fazer / o que aconteceu. Pedido original: " + _q }]);\n' +
      '          var _ai = "";\n' +
      '          try { _ai = await askCria(_hist, { voice: false, image: null }); } catch(e) { _ai = ""; }\n' +
      '          var _final = (_compOut || "") + (_ai ? ("\\n\\n---\\n" + _ai) : "");\n' +
      '          setMessages(nextMessages.concat([{ role: "assistant", text: _final }]));\n' +
      '          setLoading(false);\n' +
      '          return;\n' +
      '        } catch (ce) {\n' +
      '          setMessages(nextMessages.concat([{ role: "assistant", text: "Composio falhou: " + (ce.message || ce) }]));\n' +
      '          setLoading(false);\n' +
      '          return;\n' +
      '        }\n' +
      '      }\n' +
      '      // --- Cria Editor:';

    if (html.indexOf('// --- Cria Editor:') >= 0) {
      html = html.replace(
        'setLoading(true);\n\n    try {\n      // --- Cria Editor:',
        composioIntercept
      );
    } else if (html.indexOf(injectMarker2) >= 0) {
      html = html.replace(
        injectMarker2,
        composioIntercept.replace('// --- Cria Editor:', 'const replyText = await askCria')
      );
    }

  } catch (e) {
    console.warn('CRIA_PATCH_COMPOSIO error', e);
  }
  return html;
};
