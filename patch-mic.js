window.CRIA_PATCH_MIC = function(html) {
  try {
    if (html.indexOf('data-cria-mic') >= 0) return html;

    // 0) sendMessage aceita texto forçado (ditado)
    if (html.indexOf('async function sendMessage(image)') >= 0 && html.indexOf('forcedText') < 0) {
      html = html.replace(
        'async function sendMessage(image) {\n    const text = input.trim();',
        'async function sendMessage(image, forcedText) {\n    const text = (forcedText != null && String(forcedText).trim() ? String(forcedText) : input).trim();'
      );
    }

    // 1) Botão de microfone ao lado do Enviar
    var sendBtn =
      '<button type="submit" style={styles.sendBtn} disabled={loading || !input.trim()}>\n' +
      '          Enviar\n' +
      '        </button>';

    var withMic =
      '<button\n' +
      '          type="button"\n' +
      '          data-cria-mic="1"\n' +
      '          onClick={toggleMic}\n' +
      '          style={{ ...styles.sendBtn, background: listening ? "#ff6b6b" : "#2A3148", color: "#fff", minWidth: 44, padding: "0 12px" }}\n' +
      '          aria-label={listening ? "Parar de ouvir" : "Falar"}\n' +
      '          title={listening ? "Parar" : "Falar (ditado)"}\n' +
      '          disabled={loading}\n' +
      '        >\n' +
      '          {listening ? "⏹" : "🎤"}\n' +
      '        </button>\n' +
      '        <button type="submit" style={styles.sendBtn} disabled={loading || !input.trim()}>\n' +
      '          Enviar\n' +
      '        </button>';

    if (html.indexOf(sendBtn) >= 0) {
      html = html.replace(sendBtn, withMic);
    } else {
      html = html.replace(
        /<button type="submit" style=\{styles\.sendBtn\} disabled=\{loading \|\| !input\.trim\(\)\}>\s*Enviar\s*<\/button>/,
        withMic
      );
    }

    // 2) Estado + função de microfone dentro do ChatView
    var micLogic =
      '  const [listening, setListening] = useState(false);\n' +
      '  const recogRef = useRef(null);\n' +
      '  function toggleMic() {\n' +
      '    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;\n' +
      '    if (!SR) {\n' +
      '      alert("Seu navegador não suporta ditado por voz. Usa Chrome ou Edge.");\n' +
      '      return;\n' +
      '    }\n' +
      '    if (listening && recogRef.current) {\n' +
      '      try { recogRef.current.stop(); } catch(e) {}\n' +
      '      setListening(false);\n' +
      '      return;\n' +
      '    }\n' +
      '    var recog = new SR();\n' +
      '    recog.lang = "pt-BR";\n' +
      '    recog.interimResults = true;\n' +
      '    recog.continuous = false;\n' +
      '    recogRef.current = recog;\n' +
      '    var finalText = "";\n' +
      '    recog.onstart = function() { setListening(true); };\n' +
      '    recog.onerror = function() { setListening(false); };\n' +
      '    recog.onend = function() {\n' +
      '      setListening(false);\n' +
      '      var t = (finalText || "").trim();\n' +
      '      if (t) {\n' +
      '        setInput(t);\n' +
      '        setTimeout(function() {\n' +
      '          try { onSend(null, t); } catch(e) {}\n' +
      '        }, 80);\n' +
      '      }\n' +
      '    };\n' +
      '    recog.onresult = function(ev) {\n' +
      '      var interim = "";\n' +
      '      for (var i = ev.resultIndex; i < ev.results.length; i++) {\n' +
      '        var r = ev.results[i];\n' +
      '        if (r.isFinal) finalText += r[0].transcript + " ";\n' +
      '        else interim += r[0].transcript;\n' +
      '      }\n' +
      '      setInput((finalText + " " + interim).trim());\n' +
      '    };\n' +
      '    try { recog.start(); } catch(e) { setListening(false); }\n' +
      '  }\n';

    if (html.indexOf('const screen = useScreenShare();') >= 0 && html.indexOf('function toggleMic') < 0) {
      html = html.replace(
        'const screen = useScreenShare();',
        'const screen = useScreenShare();\n' + micLogic
      );
    }

  } catch (e) {
    console.warn('CRIA_PATCH_MIC error', e);
  }
  return html;
};
