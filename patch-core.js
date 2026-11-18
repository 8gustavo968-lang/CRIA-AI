window.CRIA_PATCH_CORE = function(html) {
  try {
    if (html.indexOf('CRIA_CORE_V127') >= 0) return html;

    var helpers =
      "  /* CRIA_CORE_V127 */\n" +
      "  async function criaPollinations(history, systemPrompt){\n" +
      "    var msgs = [{ role: 'system', content: systemPrompt || 'Voce e a Cria, mulher brasileira informal, multi-uso: conversa, pesquisa, fotos, putaria, estudos.' }];\n" +
      "    for (var i = 0; i < history.length; i++) {\n" +
      "      var m = history[i];\n" +
      "      msgs.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.text || '') });\n" +
      "    }\n" +
      "    var res = await fetch('https://text.pollinations.ai/', {\n" +
      "      method: 'POST',\n" +
      "      headers: { 'Content-Type': 'application/json' },\n" +
      "      body: JSON.stringify({ messages: msgs, model: 'openai', seed: Math.floor(Math.random()*99999) })\n" +
      "    });\n" +
      "    if (!res.ok) throw new Error('fallback ' + res.status);\n" +
      "    var txt = await res.text();\n" +
      "    if (!txt || !String(txt).trim()) throw new Error('fallback vazio');\n" +
      "    return String(txt).trim();\n" +
      "  }\n" +
      "  async function criaImageSearch(query){\n" +
      "    query = String(query || '').trim();\n" +
      "    if (!query) return [];\n" +
      "    var urls = [];\n" +
      "    try {\n" +
      "      var api = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +\n" +
      "        encodeURIComponent(query) + '&gsrlimit=6&gsrnamespace=6&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*';\n" +
      "      var r = await fetch(api);\n" +
      "      var j = await r.json();\n" +
      "      var pages = (j.query && j.query.pages) ? Object.values(j.query.pages) : [];\n" +
      "      pages.sort(function(a,b){ return (a.index||0)-(b.index||0); });\n" +
      "      for (var i = 0; i < pages.length; i++) {\n" +
      "        var ii = pages[i].imageinfo && pages[i].imageinfo[0];\n" +
      "        if (!ii) continue;\n" +
      "        var u = ii.thumburl || ii.url;\n" +
      "        if (u && /\\.(jpg|jpeg|png|gif|webp)/i.test(u)) urls.push(u.split('?')[0]);\n" +
      "      }\n" +
      "    } catch (e) {}\n" +
      "    if (!urls.length) {\n" +
      "      var q = encodeURIComponent(query.split(/\\s+/).slice(0,3).join(','));\n" +
      "      urls.push('https://loremflickr.com/640/480/' + q + '?lock=' + Math.floor(Math.random()*9999));\n" +
      "    }\n" +
      "    return urls.slice(0, 3);\n" +
      "  }\n" +
      "  function criaWantsPhoto(text){\n" +
      "    return /\\b(foto|fotos|imagem|imagens|print|manda\\s+(uma\\s+)?foto|me\\s+mostra|mostra\\s+(uma\\s+)?(foto|imagem)|picture|photo|selfie)\\b/i.test(String(text||''));\n" +
      "  }\n" +
      "  function criaPhotoQuery(text){\n" +
      "    var t = String(text||'');\n" +
      "    var m = t.match(/(?:foto|imagem|mostra|picture|photo|selfie)\\s+(?:de\\s+|do\\s+|da\\s+|dum\\s+|duma\\s+|com\\s+)?(.+)/i);\n" +
      "    if (m) return m[1].replace(/[?!.,]+$/,'').trim().slice(0, 80);\n" +
      "    return t.replace(/\\b(manda|me|uma|foto|fotos|imagem|imagens|mostra|por\\s+favor|pfv)\\b/gi,' ').replace(/\\s+/g,' ').trim().slice(0, 80) || 'retrato';\n" +
      "  }\n";

    if (html.indexOf('async function sendMessage') >= 0 && html.indexOf('CRIA_CORE_V127') < 0) {
      html = html.replace('async function sendMessage', helpers + 'async function sendMessage');
    }

    html = html.replace(
      'throw new Error(lastError ? "não consegui pensar numa resposta agora" : "nenhuma chave configurada pra essa função");',
      'try { if (typeof criaPollinations === "function") { var _fb = await criaPollinations(history, systemPrompt); if (_fb) return _fb; } } catch (_pe) { lastError = _pe; }\n' +
      '      throw new Error(lastError ? ("falhou: " + (lastError.message || lastError)) : "sem chave — abre Configuracoes e cola Groq/Gemini/OpenRouter");'
    );

    html = html.replace(
      /const FALLBACK_ORDER = \[[^\]]+\];/g,
      'const FALLBACK_ORDER = ["groq", "openrouter", "gemini", "mistral", "deepseek", "cerebras", "cohere", "aion", "claude"];'
    );

    var newSend =
      "setLoading(true);\n\n" +
      "    try {\n" +
      "      /* CRIA_CORE_SEND */\n" +
      "      var _webNote = \"\";\n" +
      "      var _photoUrls = [];\n" +
      "      try {\n" +
      "        if (typeof criaIsSearchIntent === \"function\") {\n" +
      "          var _sq = criaIsSearchIntent(text);\n" +
      "          if (_sq && typeof criaWebSearch === \"function\") {\n" +
      "            var _sr = await criaWebSearch(_sq);\n" +
      "            if (_sr) _webNote += \"\\n\\n[RESULTADOS DA WEB]:\\n\" + _sr;\n" +
      "          }\n" +
      "        }\n" +
      "        if (typeof criaIsSexyIntent === \"function\" && criaIsSexyIntent(text) && typeof criaSexyLinks === \"function\") {\n" +
      "          _webNote += \"\\n\\n[LINKS XXX]:\\n\" + criaSexyLinks(text);\n" +
      "        }\n" +
      "        if (typeof criaWantsPhoto === \"function\" && criaWantsPhoto(text)) {\n" +
      "          _photoUrls = await criaImageSearch(criaPhotoQuery(text));\n" +
      "          if (_photoUrls.length) _webNote += \"\\n\\n[FOTOS — diga que mandou, urls anexadas auto]:\\n\" + _photoUrls.join(\"\\n\");\n" +
      "        }\n" +
      "      } catch (_we) {}\n" +
      "      var _hist = nextMessages;\n" +
      "      if (_webNote) _hist = nextMessages.concat([{ role: \"user\", text: \"(contexto interno):\" + _webNote }]);\n" +
      "      const replyText = await askCria(_hist, { voice: false, image: image || null });\n" +
      "      var parts = (replyText || \"ops\").split(\"|||\").map(function(p){return p.trim();}).filter(Boolean);\n" +
      "      if (parts.length < 2 && replyText && replyText.length > 90) {\n" +
      "        var cut = replyText.indexOf(\". \");\n" +
      "        if (cut > 15 && cut < replyText.length - 15) parts = [replyText.slice(0, cut+1).trim(), replyText.slice(cut+1).trim()];\n" +
      "      }\n" +
      "      var current = nextMessages.slice();\n" +
      "      for (var i = 0; i < parts.length; i++) {\n" +
      "        var piece = { role: \"assistant\", text: parts[i] };\n" +
      "        if (i === parts.length - 1 && _photoUrls && _photoUrls.length) piece.images = _photoUrls.slice(0, 3);\n" +
      "        current = current.concat([piece]);\n" +
      "        setMessages(current);\n" +
      "        if (i < parts.length - 1) await new Promise(function(r){ setTimeout(r, 350 + Math.random()*450); });\n" +
      "      }\n" +
      "      userTurnCountRef.current += 1;\n" +
      "      if (userTurnCountRef.current % 2 === 0) updateProfile(current);\n" +
      "    } catch (err) {\n" +
      "      var em = (err && err.message) ? String(err.message) : \"erro\";\n" +
      "      setMessages(function(prev){ return prev.concat([\n" +
      "        { role: \"assistant\", text: \"aff deu ruim aqui\" },\n" +
      "        { role: \"assistant\", text: \"tenta de novo… se continuar, abre Configuracoes e cola chave Groq ou Gemini\" },\n" +
      "        { role: \"assistant\", text: \"(\" + em.slice(0, 140) + \")\" }\n" +
      "      ]); });\n" +
      "    } finally {\n" +
      "      setLoading(false);\n" +
      "    }";

    var sendRe = /setLoading\(true\);[\s\S]*?finally \{\s*setLoading\(false\);\s*\}/;
    if (html.indexOf('CRIA_CORE_SEND') < 0 && sendRe.test(html)) {
      html = html.replace(sendRe, newSend);
    }

    if (html.indexOf('m.images') < 0) {
      html = html.replace(
        '{m.text}</div>',
        '{m.text}{m.images && m.images.map((u, ii) => (<img key={ii} src={u} alt=\"foto\" style={{display:\"block\",maxWidth:\"100%\",borderRadius:12,marginTop:8}} />))}</div>'
      );
    }
  } catch (e) {
    console.warn('CRIA_PATCH_CORE error', e);
  }
  return html;
};
