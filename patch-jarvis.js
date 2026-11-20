window.CRIA_PATCH_JARVIS = function(html) {
  try {
    if (html.indexOf('CRIA_JARVIS_V140') >= 0) return html;

    if (html.indexOf('CRIA_JARVIS_TAB') < 0) {
      html = html.replace(
        '<button onClick={() => setMode("image")} style={{ ...styles.tabBtn, ...(mode === "image" ? styles.tabBtnActive : {}) }}>\n            Criar imagem\n          </button>',
        '<button onClick={() => setMode("image")} style={{ ...styles.tabBtn, ...(mode === "image" ? styles.tabBtnActive : {}) }}>\n            Criar imagem\n          </button>\n          <button onClick={() => setMode("jarvis")} style={{ ...styles.tabBtn, ...(mode === "jarvis" ? styles.tabBtnActive : {}) }}>{/* CRIA_JARVIS_TAB */}Inteligente</button>'
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
      var component = [
        '/* CRIA_JARVIS_V140 */',
        'function JarvisPanel({ messages, setMessages, askCria, loading, setLoading }) {',
        '  const [jInput, setJInput] = useState("");',
        '  const [jLines, setJLines] = useState([{ t: "SISTEMA ONLINE \u00b7 microfone pronto", side: "sys" }]);',
        '  const [speaking, setSpeaking] = useState(false);',
        '  const [listening, setListening] = useState(false);',
        '  const [pulse, setPulse] = useState(0);',
        '  const [level, setLevel] = useState(0);',
        '  const boxRef = useRef(null);',
        '  const recogRef = useRef(null);',
        '  const busyRef = useRef(false);',
        '  useEffect(function(){ var i=setInterval(function(){ setPulse(function(p){ return (p+2)%360; }); setLevel(function(l){ return listening || speaking ? 0.35+Math.random()*0.65 : 0.12+Math.random()*0.08; }); }, 50); return function(){ clearInterval(i); }; }, [listening, speaking]);',
        '  useEffect(function(){ if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; }, [jLines]);',
        '  useEffect(function(){ return function(){ try{ if(recogRef.current) recogRef.current.stop(); window.speechSynthesis && window.speechSynthesis.cancel(); }catch(e){} }; }, []);',
        '  function jSpeak(text){',
        '    return new Promise(function(resolve){',
        '      try {',
        '        if (!window.speechSynthesis) { resolve(); return; }',
        '        window.speechSynthesis.cancel();',
        '        var u = new SpeechSynthesisUtterance(String(text).slice(0, 800));',
        '        u.lang = "pt-BR"; u.rate = 1.18; u.pitch = 1.0;',
        '        var voices = window.speechSynthesis.getVoices() || [];',
        '        var v = voices.find(function(x){ return /pt(-|_)?BR/i.test(x.lang); }) || voices.find(function(x){ return /pt|Portuguese/i.test(x.lang+" "+x.name); });',
        '        if (v) u.voice = v;',
        '        setSpeaking(true);',
        '        u.onend = function(){ setSpeaking(false); resolve(); };',
        '        u.onerror = function(){ setSpeaking(false); resolve(); };',
        '        window.speechSynthesis.speak(u);',
        '      } catch(e){ setSpeaking(false); resolve(); }',
        '    });',
        '  }',
        '  async function jReply(text){',
        '    if (!text || busyRef.current) return;',
        '    busyRef.current = true;',
        '    setLoading(true);',
        '    setJLines(function(prev){ return prev.concat([{ t: text, side: "user" }]); });',
        '    var reply = "";',
        '    try {',
        '      var hist = messages.concat([{ role: "user", text: text }]);',
        '      try { reply = await askCria(hist, { voice: false, image: null }); }',
        '      catch (err) { reply = "online local. te ouvi. me diz o pr\u00f3ximo."; }',
        '      if (!reply) reply = "pode repetir?";',
        '      reply = String(reply).split("|||")[0].replace(/\\[FOTO:[^\\]]*\\]/gi, "").trim();',
        '      setMessages(function(prev){ return prev.concat([{ role: "user", text: text }, { role: "assistant", text: reply }]); });',
        '      setJLines(function(prev){ return prev.concat([{ t: reply, side: "ai" }]); });',
        '      await jSpeak(reply);',
        '    } finally {',
        '      setLoading(false);',
        '      busyRef.current = false;',
        '    }',
        '  }',
        '  function jSend(e){',
        '    if (e && e.preventDefault) e.preventDefault();',
        '    var text = (jInput || "").trim();',
        '    if (!text) return;',
        '    setJInput("");',
        '    jReply(text);',
        '  }',
        '  function toggleLive(){',
        '    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;',
        '    if (!SR) { setJLines(function(p){ return p.concat([{ t: "microfone/voz n\u00e3o suportado neste navegador", side: "sys" }]); }); return; }',
        '    if (listening && recogRef.current) {',
        '      try { recogRef.current.stop(); } catch(e){}',
        '      setListening(false);',
        '      return;',
        '    }',
        '    var r = new SR();',
        '    r.lang = "pt-BR";',
        '    r.continuous = true;',
        '    r.interimResults = true;',
        '    r.maxAlternatives = 1;',
        '    r.onresult = function(ev){',
        '      var finalTxt = "";',
        '      for (var i = ev.resultIndex; i < ev.results.length; i++) {',
        '        if (ev.results[i].isFinal) finalTxt += ev.results[i][0].transcript;',
        '      }',
        '      finalTxt = (finalTxt || "").trim();',
        '      if (finalTxt && !busyRef.current && !speaking) jReply(finalTxt);',
        '    };',
        '    r.onerror = function(){ setListening(false); };',
        '    r.onend = function(){',
        '      if (listening && recogRef.current === r) {',
        '        try { r.start(); } catch(e){ setListening(false); }',
        '      } else setListening(false);',
        '    };',
        '    recogRef.current = r;',
        '    try { r.start(); setListening(true); } catch(e){ setListening(false); }',
        '  }',
        '  var bars = [0,1,2,3,4,5,6,7,8,9,10,11];',
        '  var status = speaking ? "FALANDO" : loading ? "PENSANDO" : listening ? "OUVINDO" : "ONLINE";',
        '  var statusColor = speaking ? "#7CFFB2" : loading ? "#ffd56a" : listening ? "#ff6b9d" : "#00e5ff";',
        '  return (',
        '    <main style={{ flex:1, display:"flex", flexDirection:"column", background:"radial-gradient(ellipse at 50% 30%, #0d1f3c 0%, #05070f 55%, #020308 100%)", color:"#e8fbff", overflow:"hidden", position:"relative" }}>',
        '      <div style={{ position:"absolute", inset:0, pointerEvents:"none", opacity:0.25, backgroundImage:"linear-gradient(rgba(0,229,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.07) 1px, transparent 1px)", backgroundSize:"32px 32px" }} />',
        '      <div style={{ position:"absolute", left:0, right:0, height:2, top:0, background:"linear-gradient(90deg,transparent,#00e5ff,transparent)", opacity:0.5 }} />',
        '      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"18px 12px 6px", gap:10, position:"relative", zIndex:1 }}>',
        '        <div style={{ position:"relative", width:150, height:150, transform: (listening||speaking) ? "scale("+ (1+level*0.06) +")" : "scale(1)", transition: "transform .15s ease" }}>',
        '          <div style={{ position:"absolute", inset:0, borderRadius:"50%", background: "conic-gradient(from "+pulse+"deg, #00e5ff, #7c4dff, #ff6b9d, #00e5ff)", opacity:0.95, boxShadow: "0 0 "+(30+level*40)+"px rgba(0,229,255,"+(0.25+level*0.4)+")" }} />',
        '          <div style={{ position:"absolute", inset:6, borderRadius:"50%", background:"radial-gradient(circle at 40% 35%, #13284a, #05070f 70%)", border:"1px solid rgba(0,229,255,0.35)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:4 }}>',
        '            <div style={{ fontSize:12, letterSpacing:3, color:"#00e5ff", fontWeight:700 }}>CRIA</div>',
        '            <div style={{ fontSize:10, color: statusColor, letterSpacing:1 }}>{status}</div>',
        '            <div style={{ display:"flex", gap:3, height:22, alignItems:"flex-end", marginTop:4 }}>',
        '              {bars.map(function(b){ var h = 4 + level * (8 + (b%5)*3) * (0.5+Math.sin((pulse+b*20)*Math.PI/180)*0.5); return <div key={b} style={{ width:3, height:h, borderRadius:2, background: statusColor, opacity:0.85 }} />; })}',
        '            </div>',
        '          </div>',
        '        </div>',
        '        <div style={{ fontSize:11, opacity:0.75, letterSpacing:1 }}>MODO INTELIGENTE \u00b7 AO VIVO</div>',
        '        <button type="button" onClick={toggleLive} style={{ marginTop:2, padding:"10px 18px", borderRadius:999, border:"1px solid "+(listening?"#ff6b9d":"#00e5ff66"), background: listening ? "linear-gradient(135deg,#ff6b9d33,#7c4dff33)" : "linear-gradient(135deg,#00e5ff22,#7c4dff22)", color:"#e8fbff", fontWeight:700, cursor:"pointer", boxShadow: listening ? "0 0 24px #ff6b9d55" : "0 0 12px #00e5ff22" }}>{listening ? "\u23f9 Parar microfone" : "\ud83c\udf99 Falar ao vivo"}</button>',
        '      </div>',
        '      <div ref={boxRef} style={{ flex:1, overflowY:"auto", padding:"10px 16px 8px", fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace", fontSize:13, position:"relative", zIndex:1 }}>',
        '        {jLines.map(function(line, i){',
        '          var color = line.side==="user" ? "#ffd56a" : line.side==="sys" ? "#7a90a8" : "#7CFFB2";',
        '          var align = line.side==="user" ? "flex-end" : "flex-start";',
        '          var bg = line.side==="user" ? "rgba(255,213,106,0.08)" : line.side==="ai" ? "rgba(124,255,178,0.06)" : "transparent";',
        '          return <div key={i} style={{ display:"flex", justifyContent:align, marginBottom:8 }}><div style={{ maxWidth:"92%", padding:"8px 10px", borderRadius:12, background:bg, color:color, border:"1px solid rgba(255,255,255,0.04)" }}>{line.t}</div></div>;',
        '        })}',
        '      </div>',
        '      <form onSubmit={jSend} style={{ display:"flex", gap:8, padding:12, borderTop:"1px solid rgba(0,229,255,0.12)", position:"relative", zIndex:1 }}>',
        '        <input value={jInput} onChange={function(e){ setJInput(e.target.value); }} placeholder="Digite ou use o microfone ao vivo\u2026" style={{ flex:1, background:"rgba(10,18,32,0.9)", border:"1px solid rgba(0,229,255,0.28)", borderRadius:12, padding:"12px 14px", color:"#e8fbff", outline:"none" }} />',
        '        <button type="submit" disabled={loading || !jInput.trim()} style={{ background:"linear-gradient(135deg,#00e5ff,#7c4dff)", border:"none", borderRadius:12, padding:"12px 16px", color:"#041018", fontWeight:800, cursor:"pointer", opacity: loading || !jInput.trim() ? 0.5 : 1 }}>GO</button>',
        '      </form>',
        '    </main>',
        '  );',
        '}',
        ''
      ].join('\n');

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
