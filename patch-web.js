window.CRIA_PATCH_WEB = function(html) {
  try {
    if (html.indexOf('CRIA_WEB_SEARCH_V1') >= 0) return html;
    var helpers =
      "  /* CRIA_WEB_SEARCH_V1 */\n" +
      "  async function criaWebSearch(query){\n" +
      "    query = String(query || '').trim();\n" +
      "    if (!query) return '';\n" +
      "    var lines = [];\n" +
      "    try {\n" +
      "      var wiki = 'https://pt.wikipedia.org/w/api.php?action=opensearch&search=' + encodeURIComponent(query) + '&limit=5&namespace=0&format=json&origin=*';\n" +
      "      var wr = await fetch(wiki);\n" +
      "      var wj = await wr.json();\n" +
      "      var titles = wj[1] || []; var descs = wj[2] || []; var urls = wj[3] || [];\n" +
      "      for (var k = 0; k < titles.length; k++) lines.push('- ' + titles[k] + (descs[k] ? ': ' + descs[k] : '') + (urls[k] ? ' ' + urls[k] : ''));\n" +
      "    } catch (e) {}\n" +
      "    if (!lines.length) {\n" +
      "      var q = encodeURIComponent(query);\n" +
      "      lines.push('- Google: https://www.google.com/search?q=' + q);\n" +
      "      lines.push('- DuckDuckGo: https://duckduckgo.com/?q=' + q);\n" +
      "    }\n" +
      "    return lines.slice(0, 8).join('\\n');\n" +
      "  }\n" +
      "  function criaIsSearchIntent(text){\n" +
      "    var t = String(text || '').trim();\n" +
      "    var m = t.match(/^(?:busca\\s+cria|\\/busca|pesquisar?|search)\\s*[:\\-]?\\s*(.+)$/i);\n" +
      "    if (m) return m[1].trim();\n" +
      "    if (/\\b(pesquisa|pesquisar|busca|buscar|procura|procurar)\\b/i.test(t) && t.length < 120)\n" +
      "      return t.replace(/^(me\\s+)?(pesquisa|pesquisar|busca|buscar|procura|procurar)\\s+(pra\\s+mim\\s+|sobre\\s+|por\\s+)?/i, '').trim() || t;\n" +
      "    return null;\n" +
      "  }\n" +
      "  function criaIsSexyIntent(text){\n" +
      "    return /xxx|porn|porno|safad|putaria|foder|fode|chupar|buceta|pau|gozar|sexo|funk.*pau|dan[cç]ar.*pau|sentar|cavalgar|gemer|tes[aã]o|boquete|anal|gozada/i.test(String(text||''));\n" +
      "  }\n" +
      "  function criaSexyLinks(text){\n" +
      "    var low = String(text||'').toLowerCase();\n" +
      "    var tag = 'sex';\n" +
      "    if (/funk|twerk|rebol/.test(low)) tag = 'funk+twerk';\n" +
      "    else if (/boquete|chupar|oral/.test(low)) tag = 'blowjob';\n" +
      "    else if (/anal/.test(low)) tag = 'anal';\n" +
      "    else if (/cavalgar|sentar/.test(low)) tag = 'cowgirl';\n" +
      "    else if (/gozar|gozada/.test(low)) tag = 'cumshot';\n" +
      "    return 'https://www.pornhub.com/video/search?search=' + tag + '\\n' +\n" +
      "      'https://www.xvideos.com/?k=' + tag + '\\n' +\n" +
      "      'https://www.xnxx.com/search/' + tag;\n" +
      "  }\n";

    if (html.indexOf('async function sendMessage') >= 0 && html.indexOf('criaWebSearch') < 0) {
      html = html.replace('async function sendMessage', helpers + 'async function sendMessage');
    }

    var hook =
      'setLoading(true);\n\n    try {\n      /* CRIA_WEB_SEND_HOOK */\n' +
      '      var _webNote = "";\n' +
      '      try {\n' +
      '        var _sq = (typeof criaIsSearchIntent === "function") ? criaIsSearchIntent(text) : null;\n' +
      '        var _sexy = (typeof criaIsSexyIntent === "function") && criaIsSexyIntent(text);\n' +
      '        if (_sq) { var _sr = await criaWebSearch(_sq); if (_sr) _webNote += "\\n\\n[RESULTADOS DA WEB]:\\n" + _sr; }\n' +
      '        if (_sexy && typeof criaSexyLinks === "function") _webNote += "\\n\\n[LINKS XXX — manda 1 ou 2 de forma safada]:\\n" + criaSexyLinks(text);\n' +
      '        if (!_sq && !_sexy && /\\b(noticia|hoje|pre[cç]o|clima|quem e|o que e)\\b/i.test(text)) {\n' +
      '          var _sr2 = await criaWebSearch(text); if (_sr2) _webNote += "\\n\\n[RESULTADOS DA WEB]:\\n" + _sr2;\n' +
      '        }\n' +
      '      } catch (_we) {}\n' +
      '      var _hist = nextMessages;\n' +
      '      if (_webNote) _hist = nextMessages.concat([{ role: "user", text: "(contexto interno):" + _webNote }]);\n';

    if (html.indexOf('CRIA_WEB_SEND_HOOK') < 0) {
      html = html.replace(
        'setLoading(true);\n\n    try {\n      const replyText = await askCria(nextMessages, { voice: false, image: image || null });',
        hook + '      const replyText = await askCria(_hist, { voice: false, image: image || null });'
      );
      html = html.replace(
        'setLoading(true);\n\n    try {\n      const replyText = await askCria(nextMessages, { voice: false, image: (typeof _imgArg !== "undefined" ? _imgArg : (image || null)) });',
        hook + '      const replyText = await askCria(_hist, { voice: false, image: (typeof _imgArg !== "undefined" ? _imgArg : (image || null)) });'
      );
    }
  } catch (e) {
    console.warn('CRIA_PATCH_WEB error', e);
  }
  return html;
};
