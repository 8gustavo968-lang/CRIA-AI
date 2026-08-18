window.CRIA_PATCH_VOICE = function(html) {
  try {
    // ========== REMOVE LIGAR MODE ==========
    html = html.replace(/<button onClick=\{\(\) => setMode\("voice"\)\}[^>]*>\s*Ligar\s*<\/button>/g, '');
    html = html.replace(/\{mode === "voice" && \([\s\S]*?<VoiceCall[\s\S]*?\/>\s*\)\}/g, '');
    html = html.replace(/ou tocar em Ligar pra falar comigo por voz\./gi, 'toque no 🔊 nas minhas respostas pra me ouvir falando.');

    // Soften browser TTS
    html = html.replace(/utter\.rate = 0\.98 \+ Math\.random\(\) \* 0\.07;/g, 'utter.rate = 0.85 + Math.random() * 0.06;');
    html = html.replace(/utter\.pitch = 1\.0 \+ Math\.random\(\) \* 0\.06;/g, 'utter.pitch = 1.15; utter.volume = 0.72;');

    // ========== ADD ELEVENLABS STATE ==========
    html = html.replace(
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", openai: "", elevenlabs: "" });'
    );
    html = html.replace(
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", openai: "" });',
      'const [keys, setKeys] = useState({ groq: "", deepseek: "", openrouter: "", gemini: "", cerebras: "", mistral: "", openai: "", elevenlabs: "" });'
    );

    html = html.replace(
      'const [voiceGender, setVoiceGender] = useState(() => loadLocal("cria_voice_gender", "feminina"));',
      'const [voiceGender, setVoiceGender] = useState(() => loadLocal("cria_voice_gender", "feminina"));\n  const [elevenVoiceId, setElevenVoiceId] = useState(() => loadLocal("cria_eleven_voice_id", "KLKAEnKiSW8hC8KcEv8o"));\n  const [elevenKey, setElevenKey] = useState(() => loadLocal("cria_eleven_key", ""));'
    );

    html = html.replace(
      '}, [voiceGender]);',
      '}, [voiceGender]);\n  useEffect(() => { saveLocal("cria_eleven_voice_id", elevenVoiceId); }, [elevenVoiceId]);\n  useEffect(() => { saveLocal("cria_eleven_key", elevenKey); }, [elevenKey]);'
    );

    // ========== ADD SETTINGS FIELDS ==========
    html = html.replace(
      '<p style={styles.settingsHint}>',
      `<p style={styles.settingsLabel}>ElevenLabs (voz personalizada)</p>
          <div style={styles.keyGrid}>
            <div style={styles.keyFieldWrap}>
              <label style={styles.keyLabel}>Chave ElevenLabs</label>
              <div style={styles.keyInputRow}>
                <input
                  style={styles.keyInput}
                  type="password"
                  value={elevenKey}
                  onChange={(e) => setElevenKey(e.target.value)}
                  placeholder="sk_..."
                />
              </div>
              <p style={styles.keyHint}>elevenlabs.io → Profile → API Key</p>
            </div>
            <div style={styles.keyFieldWrap}>
              <label style={styles.keyLabel}>Voice ID</label>
              <div style={styles.keyInputRow}>
                <input
                  style={styles.keyInput}
                  type="text"
                  value={elevenVoiceId}
                  onChange={(e) => setElevenVoiceId(e.target.value)}
                  placeholder="Voice ID"
                />
              </div>
              <p style={styles.keyHint}>My Voices → ⋯ → Copy voice ID</p>
            </div>
          </div>
          <p style={styles.settingsHint}>`
    );

    // ========== CHATVIEW PROPS + SPEAK ==========
    html = html.replace(
      'onSend={sendMessage} scrollRef={scrollRef} />',
      'onSend={sendMessage} scrollRef={scrollRef} voiceGender={voiceGender} elevenKey={elevenKey} elevenVoiceId={elevenVoiceId} />'
    );

    html = html.replace(
      'function ChatView({ messages, loading, input, setInput, onSend, scrollRef }) {',
      'function ChatView({ messages, loading, input, setInput, onSend, scrollRef, voiceGender, elevenKey, elevenVoiceId }) {'
    );
    html = html.replace(
      'function ChatView({ messages, loading, input, setInput, onSend, scrollRef, voiceGender, getKey }) {',
      'function ChatView({ messages, loading, input, setInput, onSend, scrollRef, voiceGender, elevenKey, elevenVoiceId }) {'
    );

    var speakFn = `function ChatView({ messages, loading, input, setInput, onSend, scrollRef, voiceGender, elevenKey, elevenVoiceId }) {
  const screen = useScreenShare();
  async function speakText(text) {
    if (!text) return;
    // 1) ElevenLabs (sua voz)
    var ek = (elevenKey || "").trim();
    var vid = (elevenVoiceId || "").trim();
    if (ek && vid) {
      try {
        var res = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + vid, {
          method: "POST",
          headers: {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": ek
          },
          body: JSON.stringify({
            text: String(text),
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true }
          })
        });
        if (res.ok) {
          var blob = await res.blob();
          var url = URL.createObjectURL(blob);
          await new Promise(function(resolve) {
            var audio = new Audio(url);
            audio.onended = function() { URL.revokeObjectURL(url); resolve(); };
            audio.onerror = function() { URL.revokeObjectURL(url); resolve(); };
            audio.volume = 0.9;
            audio.play().catch(function(){ resolve(); });
          });
          return;
        }
      } catch (e) { console.warn("ElevenLabs falhou", e); }
    }
    // 2) Fallback navegador fofinho
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(String(text));
    utter.lang = "pt-BR";
    utter.rate = 0.85;
    utter.pitch = (voiceGender === "feminina") ? 1.15 : 0.95;
    utter.volume = 0.75;
    try {
      var voices = window.speechSynthesis.getVoices() || [];
      var pt = voices.filter(function(v){ return v.lang && v.lang.indexOf("pt") === 0; });
      var prefer = null;
      for (var i = 0; i < pt.length; i++) {
        var n = (pt[i].name || "").toLowerCase();
        if (voiceGender === "feminina" && /female|mulher|luciana|maria|vitoria|camila|fernanda|google/.test(n)) { prefer = pt[i]; break; }
        if (voiceGender !== "feminina" && /male|homem|daniel|felipe|ricardo/.test(n)) { prefer = pt[i]; break; }
      }
      if (!prefer && pt[0]) prefer = pt[0];
      if (prefer) utter.voice = prefer;
    } catch(e){}
    window.speechSynthesis.speak(utter);
  }`;

    html = html.replace(
      /function ChatView\(\{ messages, loading, input, setInput, onSend, scrollRef(?:, voiceGender, (?:getKey|elevenKey, elevenVoiceId))? \}\) \{\n  const screen = useScreenShare\(\);(?:\n  function speakText[\s\S]*?window\.speechSynthesis\.speak\(utter\);\n  \})?/,
      speakFn
    );

    // Add 🔊 button
    html = html.replace(
      'styles.bubbleAssistant) }}>{m.text}</div>',
      'styles.bubbleAssistant) }}><span>{m.text}</span>{m.role === "assistant" && (<button type="button" onClick={function(){ speakText(m.text); }} title="Ouvir" style={{marginLeft:"8px",background:"transparent",border:"none",color:"#F2B705",cursor:"pointer",fontSize:"15px",padding:"0 2px",verticalAlign:"middle",opacity:0.9}}>🔊</button>)}</div>'
    );

  } catch (e) {
    console.warn("CRIA_PATCH_VOICE error", e);
  }
  return html;
};
