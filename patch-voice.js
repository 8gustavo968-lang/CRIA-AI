window.CRIA_PATCH_VOICE = function(html) {
  try {
    // 1. Remove Ligar tab
    html = html.replace(/<button onClick=\{\(\) => setMode\("voice"\)\}[^>]*>\s*Ligar\s*<\/button>/g, '');

    // 2. Remove VoiceCall mode block
    html = html.replace(/\{mode === "voice" && \([\s\S]*?<VoiceCall[\s\S]*?\/>\s*\)\}/g, '');

    // 3. Update welcome
    html = html.replace(/ou tocar em Ligar pra falar comigo por voz\./gi, 'toque no 🔊 nas minhas respostas pra me ouvir falando.');

    // 4. Soften TTS if present
    html = html.replace(/utter\.rate = 0\.98 \+ Math\.random\(\) \* 0\.07;/g, 'utter.rate = 0.85 + Math.random() * 0.06;');
    html = html.replace(/utter\.pitch = 1\.0 \+ Math\.random\(\) \* 0\.06;/g, 'utter.pitch = 1.15; utter.volume = 0.72;');

    // 5. Pass voiceGender + getKey to ChatView
    html = html.replace(
      'onSend={sendMessage} scrollRef={scrollRef} />',
      'onSend={sendMessage} scrollRef={scrollRef} voiceGender={voiceGender} getKey={getKey} />'
    );

    // 6. ChatView signature
    html = html.replace(
      'function ChatView({ messages, loading, input, setInput, onSend, scrollRef }) {',
      'function ChatView({ messages, loading, input, setInput, onSend, scrollRef, voiceGender, getKey }) {'
    );

    // 7. Inject speakText helper
    html = html.replace(
      'function ChatView({ messages, loading, input, setInput, onSend, scrollRef, voiceGender, getKey }) {\n  const screen = useScreenShare();',
      'function ChatView({ messages, loading, input, setInput, onSend, scrollRef, voiceGender, getKey }) {\n  const screen = useScreenShare();\n  function speakText(text) {\n    if (!text || !window.speechSynthesis) return;\n    window.speechSynthesis.cancel();\n    var utter = new SpeechSynthesisUtterance(String(text));\n    utter.lang = "pt-BR";\n    utter.rate = 0.85;\n    utter.pitch = (voiceGender === "feminina") ? 1.15 : 0.95;\n    utter.volume = 0.75;\n    try {\n      var voices = window.speechSynthesis.getVoices() || [];\n      var pt = voices.filter(function(v){ return v.lang && v.lang.indexOf("pt") === 0; });\n      var prefer = null;\n      for (var i = 0; i < pt.length; i++) {\n        var n = (pt[i].name || "").toLowerCase();\n        if (voiceGender === "feminina" && /female|mulher|luciana|maria|vitoria|camila|fernanda|google/.test(n)) { prefer = pt[i]; break; }\n        if (voiceGender !== "feminina" && /male|homem|daniel|felipe|ricardo/.test(n)) { prefer = pt[i]; break; }\n      }\n      if (!prefer && pt[0]) prefer = pt[0];\n      if (prefer) utter.voice = prefer;\n    } catch(e){}\n    window.speechSynthesis.speak(utter);\n  }'
    );

    // 8. Add 🔊 button on assistant bubbles
    html = html.replace(
      'styles.bubbleAssistant) }}>{m.text}</div>',
      'styles.bubbleAssistant) }}><span>{m.text}</span>{m.role === "assistant" && (<button type="button" onClick={function(){ speakText(m.text); }} title="Ouvir" style={{marginLeft:"8px",background:"transparent",border:"none",color:"#F2B705",cursor:"pointer",fontSize:"15px",padding:"0 2px",verticalAlign:"middle",opacity:0.9}}>🔊</button>)}</div>'
    );

  } catch (e) {
    console.warn("CRIA_PATCH_VOICE error", e);
  }
  return html;
};
