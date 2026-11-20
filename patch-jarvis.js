window.CRIA_PATCH_JARVIS = function(html) {
  try {
    if (html.indexOf('CRIA_JARVIS_V139') >= 0) return html;

    if (html.indexOf('CRIA_JARVIS_TAB') < 0) {
      html = html.replace(
        /setMode\("image"\)\}[^>]*>\s*Criar imagem\s*<\/button>/,
        function(m) {
          return m + '\n          <button onClick={() => setMode("jarvis")} style={{ ...styles.tabBtn, ...(mode === "jarvis" ? styles.tabBtnActive : {}) }}>{/* CRIA_JARVIS_TAB */}Modo inteligente</button>';
        }
      );
    }

    if (html.indexOf('CRIA_JARVIS_PANEL') < 0) {
      var panel =
        '\n      {mode === "jarvis" && (\n' +
        '        <JarvisPanel messages={messages} setMessages={setMessages} askCria={askCria} loading={loading} setLoading={setLoading} />\n' +
        '      )}\n' +
        '      /* CRIA_JARVIS_PANEL */\n';
      if (html.indexOf('{showSettings && (') >= 0) {
        html = html.replace('{showSettings && (', panel + '      {showSettings && (');
      }
    }

    if (html.indexOf('function JarvisPanel') < 0) {
      var component =
        '/* CRIA_JARVIS_V139 */\n' +
        'function JarvisPanel({ messages, setMessages, askCria, loading, setLoading }) {\n' +
        '  const [jInput, setJInput] = useState("");\n' +
        '  const [jLines, setJLines] = useState([{ t: "SISTEMA ONLINE", side: "sys" }, { t: "Modo inteligente ativo. Sem API eu falo com a voz do aparelho.", side: "sys" }]);\n' +
        '  const [speaking, setSpeaking] = useState(false);\n' +
        '  const [pulse, setPulse] = useState(0);\n' +
        '  const boxRef = useRef(null);\n' +
        '  useEffect(function(){ var i=setInterval(function(){ setPulse(function(p){ return (p+1)%360; }); }, 40); return function(){ clearInterval(i); }; }, []);\n' +
        '  useEffect(function(){ if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [jLines]);\n' +
        '  function jSpeak(text){\n' +
        '    return new Promise(function(resolve){\n' +
        '      try {\n' +
        '        if (!window.speechSynthesis) { resolve(); return; }\n' +
        '        window.speechSynthesis.cancel();\n' +
        '        var u = new SpeechSynthesisUtterance(String(text).slice(0, 500));\n' +
        '        u.lang = "pt-BR"; u.rate = 1.05; u.pitch = 1.05;\n' +
        '        var voices = window.speechSynthesis.getVoices() || [];\n' +
        '        var v = voices.find(function(x){ return /pt(-|_)?BR|Portuguese/i.test(x.lang+" "+x.name); });\n' +
        '        if (v) u.voice = v;\n' +
        '        setSpeaking(true);\n' +
        '        u.onend = function(){ setSpeaking(false); resolve(); };\n' +
        '        u.onerror = function(){ setSpeaking(false); resolve(); };\n' +
        '        window.speechSynthesis.speak(u);\n' +
        '      } catch(e){ setSpeaking(false); resolve(); }\n' +
        '    });\n' +
        '  }\n' +
        '  async function typeLine(text, side){\n' +
        '    side = side || "ai";\n' +
        '    var shown = "";\n' +
        '    setJLines(function(prev){ return prev.concat([{ t: "", side: side }]); });\n' +
        '    for (var i = 0; i < text.length; i++) {\n' +
        '      shown += text[i];\n' +
        '      (function(s){ setJLines(function(prev){ var n=prev.slice(); n[n.length-1] = Object.assign({}, n[n.length-1], { t: s }); return n; }); })(shown);\n' +
        '      await new Promise(function(r){ setTimeout(r, 12 + Math.random()*18); });\n' +
        '    }\n' +
        '  }\n' +
        '  async function jSend(e){\n' +
        '    if (e && e.preventDefault) e.preventDefault();\n' +
        '    var text = (jInput || "").trim();\n' +
        '    if (!text || loading) return;\n' +
        '    setJInput("");\n' +
        '    setJLines(function(prev){ return prev.concat([{ t: text, side: "user" }]); });\n' +
        '    setLoading(true);\n' +
        '    try {\n' +
        '      var hist = messages.concat([{ role: "user", text: text }]);\n' +
        '      var reply = "";\n' +
        '      try { reply = await askCria(hist, { voice: false, image: null }); }\n' +
        '      catch (err) { reply = "modo local ativo. processado sem chave externa. me diz o proximo passo."; }\n' +
        '      if (!reply) reply = "sistemas nominais. pode repetir o comando?";\n' +
        '      reply = String(reply).split("|||")[0].replace(/\\[FOTO:[^\\]]*\\]/gi, "").trim();\n' +
        '      setMessages(function(prev){ return prev.concat([{ role: "user", text: text }, { role: "assistant", text: reply }]); });\n' +
        '      var speakP = jSpeak(reply);\n' +
        '      await typeLine(reply, "ai");\n' +
        '      await speakP;\n' +
        '    } finally { setLoading(false); }\n' +
        '  }\n' +
        '  var ring = "conic-gradient(from " + pulse + "deg, #00e5ff, #7c4dff, #00e5ff)";\n' +
        '  return (\n' +
        '    <main style={{ flex:1, display:"flex", flexDirection:"column", background:"radial-gradient(ellipse at center,#0a1628 0%,#05070f 70%)", color:"#c8f7ff", overflow:"hidden", position:"relative" }}>\n' +
        '      <div style={{ position:"absolute", inset:0, pointerEvents:"none", opacity:0.35, backgroundImage:"linear-gradient(rgba(0,229,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.06) 1px, transparent 1px)", backgroundSize:"40px 40px" }} />\n' +
        '      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"16px 12px 8px", gap:8 }}>\n' +
        '        <div style={{ width:120, height:120, borderRadius:"50%", padding:3, background: ring, boxShadow: speaking ? "0 0 40px #00e5ff88" : "0 0 20px #00e5ff33" }}>\n' +
        '          <div style={{ width:"100%", height:"100%", borderRadius:"50%", background:"#05070f", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", border:"1px solid #00e5ff44" }}>\n' +
        '            <div style={{ fontSize:11, letterSpacing:2, color:"#00e5ff" }}>CRIA</div>\n' +
        '            <div style={{ fontSize:9, color: speaking ? "#7CFFB2" : "#7aa" }}>{speaking ? "FALANDO" : loading ? "PROCESSANDO" : "ONLINE"}</div>\n' +
        '          </div>\n' +
        '        </div>\n' +
        '        <div style={{ fontSize:11, opacity:0.7 }}>MODO INTELIGENTE \u00b7 HUD</div>\n' +
        '      </div>\n' +
        '      <div ref={boxRef} style={{ flex:1, overflowY:"auto", padding:"8px 14px", fontFamily:"ui-monospace, monospace", fontSize:13 }}>\n' +
        '        {jLines.map(function(line, i){\n' +
        '          var color = line.side==="user" ? "#ffd56a" : line.side==="sys" ? "#7aa" : "#7CFFB2";\n' +
        '          return <div key={i} style={{ marginBottom:8, color: color }}><span style={{ opacity:0.5 }}>{line.side==="user"?"\u00bb ":"\u00ab "}</span>{line.t}</div>;\n' +
        '        })}\n' +
        '      </div>\n' +
        '      <form onSubmit={jSend} style={{ display:"flex", gap:8, padding:12, borderTop:"1px solid #00e5ff22" }}>\n' +
        '        <input value={jInput} onChange={function(e){ setJInput(e.target.value); }} placeholder="Comando\u2026" style={{ flex:1, background:"#0a1220", border:"1px solid #00e5ff44", borderRadius:10, padding:"10px 12px", color:"#c8f7ff", outline:"none" }} />\n' +
        '        <button type="submit" disabled={loading || !jInput.trim()} style={{ background:"linear-gradient(135deg,#00e5ff,#7c4dff)", border:"none", borderRadius:10, padding:"10px 16px", color:"#041018", fontWeight:700, cursor:"pointer" }}>GO</button>\n' +
        '      </form>\n' +
        '    </main>\n' +
        '  );\n' +
        '}\n\n';
      if (html.indexOf('function ChatView') >= 0) {
        html = html.replace('function ChatView', component + 'function ChatView');
      } else if (html.indexOf('function Cria(') >= 0) {
        html = html.replace('function Cria(', component + 'function Cria(');
      }
    }

  } catch (e) {
    console.warn('CRIA_PATCH_JARVIS error', e);
  }
  return html;
};
