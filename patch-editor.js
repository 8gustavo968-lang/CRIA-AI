window.CRIA_PATCH_EDITOR = function(html) {
  try {
    // Intercepta "abrir editor" / "editor de vídeo" antes de chamar a IA
    var marker = 'setLoading(true);\n\n    try {\n      const replyText = await askCria';
    var marker2 = 'setLoading(true);\n\n    try {\n      const replyText = await askCria'; // same

    var inject =
      'setLoading(true);\n\n' +
      '    try {\n' +
      '      // --- Cria Editor: atalho por texto ---\n' +
      '      var _t = (text || "").toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");\n' +
      '      var _openEditor = /\\b(abrir|abre|abrir o|abre o|ir pro|ir para|quero o|quero)|\\beditor\\b/.test(_t) && /editor|editar video|editar o video|editor de video/.test(_t);\n' +
      '      if (!_openEditor) _openEditor = /^(editor|editar video|editor de video)$/.test(_t.trim());\n' +
      '      if (!_openEditor) _openEditor = /\\b(abrir editor|abre editor|abrir o editor|abre o editor)\\b/.test(_t);\n' +
      '      if (_openEditor) {\n' +
      '        var _msg = "Beleza! Abrindo o editor de vídeo…";\n' +
      '        setMessages([...nextMessages, { role: "assistant", text: _msg }]);\n' +
      '        setLoading(false);\n' +
      '        setTimeout(function() {\n' +
      '          try {\n' +
      '            var url = "./editor.html";\n' +
      '            if (window.top && window.top !== window) {\n' +
      '              window.top.location.href = url;\n' +
      '            } else {\n' +
      '              window.location.href = url;\n' +
      '            }\n' +
      '          } catch (e) {\n' +
      '            window.open("https://8gustavo968-lang.github.io/CRIA-AI/editor.html", "_blank");\n' +
      '          }\n' +
      '        }, 400);\n' +
      '        return;\n' +
      '      }\n' +
      '      const replyText = await askCria';

    // A versão com multi-mensagens do patch.js
    var markerMulti =
      'setLoading(true);\n\n    try {\n      const replyText = await askCria(nextMessages, { voice: false, image: image || null });\n      const parts';

    // Original simples
    if (html.indexOf('setLoading(true);\n\n    try {\n      const replyText = await askCria') >= 0) {
      html = html.replace(
        'setLoading(true);\n\n    try {\n      const replyText = await askCria',
        inject
      );
    }

    // Também cobre se já foi transformado em partes (após CRIA_PATCH)
    // O inject acima já cobre o início comum.

  } catch (e) {
    console.warn('CRIA_PATCH_EDITOR error', e);
  }
  return html;
};
