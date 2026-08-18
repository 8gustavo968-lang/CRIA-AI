window.CRIA_PATCH_VOICE = function(html) {
  try {
    // 1. Remove the Ligar tab button completely
    html = html.replace(
      '<button onClick={() => setMode("voice")} style={{ ...styles.tabBtn, ...(mode === "voice" ? styles.tabBtnActive : {}) }}>\n            Ligar\n          </button>',
      ''
    );

    // 2. Update the initial welcome message
    html = html.replace(
      'Ou tocar em Ligar pra falar comigo por voz.',
      'Toque no 🔊 nas minhas respostas pra me ouvir falando.'
    );
    html = html.replace(
      'ou tocar em Ligar pra falar comigo por voz.',
      'toque no 🔊 nas minhas respostas pra me ouvir falando.'
    );

    // 3. Remove VoiceCall rendering block
    html = html.replace(
      '{mode === "voice" && (\n        <VoiceCall messages={messages} setMessages={setMessages} askCria={askCria} voiceGender={voiceGender} />\n      )}',
      ''
    );
    // also try with getKey if previous patch applied
    html = html.replace(
      '{mode === "voice" && (\n        <VoiceCall messages={messages} setMessages={setMessages} askCria={askCria} voiceGender={voiceGender} getKey={getKey} />\n      )}',
      ''
    );

    // 4. Soften any remaining TTS rate/pitch
    html = html.replace(
      'utter.rate = 0.98 + Math.random() * 0.07;',
      'utter.rate = 0.85 + Math.random() * 0.06;'
    );
    html = html.replace(
      'utter.pitch = 1.0 + Math.random() * 0.06;',
      'utter.pitch = 1.12 + Math.random() * 0.08;\n        utter.volume = 0.72;'
    );

    // 5. Pass voiceGender + getKey to ChatView
    html = html.replace(
      '<ChatView messages={messages} loading={loading} input={input} setInput={setInput} onSend={sendMessage} scrollRef={scrollRef} />',
      '<ChatView messages={messages} loading={loading} input={input} setInput={setInput} onSend={sendMessage} scrollRef={scrollRef} voiceGender={voiceGender} getKey={getKey} />'
    );

    // 6. Update ChatView function signature
    html = html.replace(
      'function ChatView({ messages, loading, input, setInput, onSend, scrollRef }) {',
      'function ChatView({ messages, loading, input, setInput, onSend, scrollRef, voiceGender, getKey }) {'
    );

    // 7. Inject speakText helper right after useScreenShare in ChatView
    html = html.replace(
      'function ChatView({ messages, loading, input, setInput, onSend, scrollRef, voiceGender, getKey }) {\n  const screen = useScreenShare();',
      `function ChatView({ messages, loading, input, setInput, onSend, scrollRef, voiceGender, getKey }) {
  const screen = useScreenShare();

  function speakText(text) {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(String(text));
    utter.lang = "pt-BR";
    utter.rate = 0.85;
    utter.pitch = (voiceGender === "feminina") ? 1.15 : 0.95;
    utter.volume = 0.75;
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      const pt = voices.filter(function(v){ return v.lang && v.lang.indexOf("pt") === 0; });
      var prefer = null;
      for (var i = 0; i < pt.length; i++) {
        var n = (pt[i].name || "").toLowerCase();
        if (voiceGender === "feminina" && /female|mulher|luciana|maria|vitória|vitoria|camila|fernanda|google português do brasil/.test(n)) { prefer = pt[i]; break; }
        if (voiceGender !== "feminina" && /male|homem|daniel|felipe|ricardo/.test(n)) { prefer = pt[i]; break; }
      }
      if (!prefer && pt.length) prefer = pt[0];
      if (prefer) utter.voice = prefer;
    } catch (e) {}
    window.speechSynthesis.speak(utter);
  }`
    );

    // 8. Add 🔊 button on assistant messages
    html = html.replace(
      '<div style={{ ...styles.bubble, ...(m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant) }}>{m.text}</div>',
      `<div style={{ ...styles.bubble, ...(m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant), position: "relative" }}>
              <span>{m.text}</span>
              {m.role === "assistant" && (
                <button
                  type="button"
                  onClick={function(){ speakText(m.text); }}
                  title="Ouvir a Cria"
                  style={{
                    display: "inline-block",
                    marginLeft: "8px",
                    background: "transparent",
                    border: "none",
                    color: "#F2B705",
                    cursor: "pointer",
                    fontSize: "15px",
                    padding: "0 2px",
                    verticalAlign: "middle",
                    opacity: 0.9,
                    lineHeight: 1
                  }}
                >🔊</button>
              )}
            </div>`
    );

  } catch (e) {
    console.warn("CRIA_PATCH_VOICE error", e);
  }
  return html;
};
