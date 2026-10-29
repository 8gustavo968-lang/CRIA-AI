window.CRIA_PATCH_NOTICE = function(html) {
  try {
    if (html.indexOf('CRIA_UI_NOTICE_V1') >= 0) return html;

    html = html.replace(
      'Oi! Eu sou a Cria. Pode me perguntar qualquer coisa, pedir um texto, um resumo, uma ideia — ou tocar em Ligar pra falar comigo por voz.',
      'oi…'
    );

    var noticeBlock =
      "\n  /* CRIA_UI_NOTICE_V1 */\n" +
      "  useEffect(function(){\n" +
      "    var VER = 'dark-v126';\n" +
      "    var key = 'cria_ui_ver';\n" +
      "    var prev = null;\n" +
      "    try { prev = localStorage.getItem(key); } catch(e){}\n" +
      "    if (prev === VER) return;\n" +
      "    var t = setTimeout(function(){\n" +
      "      try { localStorage.setItem(key, VER); } catch(e){}\n" +
      "      var msgs;\n" +
      "      if (!prev) {\n" +
      "        msgs = ['to aqui','pode falar qualquer coisa comigo','pesquisa, putaria, desabafo… to afim kkk'];\n" +
      "      } else {\n" +
      "        msgs = ['pera','nossa vc mudou o visual ne','ficou mais dark… gostei','parece outro app kkk'];\n" +
      "      }\n" +
      "      (async function(){\n" +
      "        for (var i = 0; i < msgs.length; i++) {\n" +
      "          await new Promise(function(r){ setTimeout(r, 500 + Math.random()*700); });\n" +
      "          setMessages(function(p){ return p.concat([{ role: 'assistant', text: msgs[i] }]); });\n" +
      "        }\n" +
      "      })();\n" +
      "    }, 1200);\n" +
      "    return function(){ clearTimeout(t); };\n" +
      "  }, []);\n";

    html = html.replace(
      'useEffect(() => {\n    if (scrollRef.current) {\n      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;\n    }\n  }, [messages, loading]);',
      'useEffect(() => {\n    if (scrollRef.current) {\n      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;\n    }\n  }, [messages, loading]);' + noticeBlock
    );
  } catch (e) {
    console.warn('CRIA_PATCH_NOTICE error', e);
  }
  return html;
};
