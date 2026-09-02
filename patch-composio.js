window.CRIA_PATCH_COMPOSIO = function(html) {
  try {
    // remove versão antiga se existir no html (marca nova)
    if (html.indexOf('CRIA_COMPOSIO_V2') >= 0) return html;

    // injeta helpers Composio (sessão + request + connect)
    if (html.indexOf('function composioEnsureSession') < 0) {
      var helpers =
        "  /* CRIA_COMPOSIO_V2 */\n" +
        "  function composioGetKey(){\n" +
        "    try { var k = localStorage.getItem('cria_composio_key'); if (k) return k; } catch(e){}\n" +
        "    try { return atob('YWtfTWVIOUtCcnM2VFoxb2d2NnMtS1Q='); } catch(e){ return ''; }\n" +
        "  }\n" +
        "  function composioClearSession(uid){ try { localStorage.removeItem('cria_composio_sid_' + (uid||'eu')); } catch(e){} }\n" +
        "  async function composioRequest(path, method, body){\n" +
        "    var key = composioGetKey();\n" +
        "    if (!key) throw new Error('Sem chave Composio');\n" +
        "    var opts = { method: method || 'GET', headers: { 'x-api-key': key, 'Content-Type': 'application/json' } };\n" +
        "    if (body) opts.body = JSON.stringify(body);\n" +
        "    var res = await fetch('https://backend.composio.dev' + path, opts);\n" +
        "    var data = await res.json().catch(function(){ return {}; });\n" +
        "    if (!res.ok) { var err = new Error(data.message || data.error || ('HTTP ' + res.status)); err.status = res.status; err.data = data; throw err; }\n" +
        "    return data;\n" +
        "  }\n" +
        "  async function composioEnsureSession(uid, force){\n" +
        "    uid = uid || 'eu';\n" +
        "    var sk = 'cria_composio_sid_' + uid;\n" +
        "    if (!force) { try { var sid0 = localStorage.getItem(sk); if (sid0) return sid0; } catch(e){} }\n" +
        "    var sess = await composioRequest('/api/v3.1/tool_router/session', 'POST', { user_id: uid, manage_connections: { enabled: true } });\n" +
        "    var sid = sess.session_id || sess.id;\n" +
        "    try { localStorage.setItem(sk, sid); } catch(e){}\n" +
        "    return sid;\n" +
        "  }\n" +
        "  async function composioConnectToolkit(sid, toolkit){\n" +
        "    var link = await composioRequest('/api/v3.1/tool_router/session/' + sid + '/link', 'POST', { toolkit: toolkit });\n" +
        "    return { url: link.redirect_url || link.url, raw: link };\n" +
        "  }\n";
      if (html.indexOf('async function sendMessage') >= 0) {
        html = html.replace('async function sendMessage', helpers + 'async function sendMessage');
      }
    }

    // handler de comando /conectar e busca
    if (html.indexOf('CRIA_COMPOSIO_HANDLER') < 0 && html.indexOf('async function sendMessage') >= 0) {
      var handler =
        "  /* CRIA_COMPOSIO_HANDLER */\n" +
        "  async function criaHandleComposio(userText){\n" +
        "    var t = String(userText || '').trim();\n" +
        "    var low = t.toLowerCase();\n" +
        "    if (!/^\\/(conectar|composio|tools)/i.test(low) && low.indexOf('conectar ') !== 0) return null;\n" +
        "    var uid = (typeof userId !== 'undefined' && userId) ? userId : 'eu';\n" +
        "    var toolkit = t.replace(/^\\/(conectar|composio|tools)\\s*/i, '').replace(/^conectar\\s+/i, '').trim().toLowerCase() || 'gmail';\n" +
        "    var lines = [];\n" +
        "    try {\n" +
        "      var sid = await composioEnsureSession(uid, false);\n" +
        "      var conn = await composioConnectToolkit(sid, toolkit);\n" +
        "      if (conn && conn.url) {\n" +
        "          lines.push('🔐 **Login: ' + toolkit + '**');\n" +
        "          lines.push('[Conectar ' + toolkit + '](' + conn.url + ')');\n" +
        "          lines.push(conn.url);\n" +
        "      } else {\n" +
        "          lines.push('Não consegui gerar link de login para ' + toolkit + '.');\n" +
        "      }\n" +
        "    } catch (e) {\n" +
        "      lines.push('Falha Composio: ' + (e.message || e));\n" +
        "    }\n" +
        "    return lines.join('\\n');\n" +
        "  }\n";
      html = html.replace('async function sendMessage', handler + 'async function sendMessage');
    }

    // fix triple-backtick string that was breaking Babel
    html = html.replace(
      /lines\.push\("```\\n" \+ JSON\.stringify\(searchData, null, 2\)\.slice\(0, 1800\) \+ "\\n```"\);/g,
      'lines.push(["```", JSON.stringify(searchData, null, 2).slice(0, 1800), "```"].join("\\n"));'
    );
    html = html.replace(
      /lines\.push\("```\n" \+ JSON\.stringify\(searchData, null, 2\)\.slice\(0, 1800\) \+ "\n```"\);/g,
      'lines.push(["```", JSON.stringify(searchData, null, 2).slice(0, 1800), "```"].join("\\n"));'
    );

  } catch (e) {
    console.warn('CRIA_PATCH_COMPOSIO error', e);
  }
  return html;
};
