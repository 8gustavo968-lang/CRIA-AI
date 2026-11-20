window.CRIA_PATCH_FISH_NOTIFY = function(html) {
  try {
    if (html.indexOf('CRIA_FISH_NOTIFY_V138') >= 0) return html;

    html = html.replace(
      'const [elevenKey, setElevenKey] = useState(() => loadLocal("cria_eleven_key", ""));',
      'const [elevenKey, setElevenKey] = useState(() => loadLocal("cria_eleven_key", ""));\n' +
      '  /* CRIA_FISH_NOTIFY_V138 */\n' +
      '  const [fishKey, setFishKey] = useState(function(){ return loadLocal("cria_fish_key", ""); });\n' +
      '  const [fishVoiceId, setFishVoiceId] = useState(function(){ return loadLocal("cria_fish_voice", ""); });\n' +
      '  const [fishModel, setFishModel] = useState(function(){ return loadLocal("cria_fish_model", "s2.1-pro-free"); });\n' +
      '  const [criaNotifOn, setCriaNotifOn] = useState(function(){ return loadLocal("cria_notif_on", "1") !== "0"; });\n' +
      '  const [criaPingOn, setCriaPingOn] = useState(function(){ return loadLocal("cria_ping_on", "1") !== "0"; });\n' +
      '  useEffect(function(){ saveLocal("cria_fish_key", fishKey); }, [fishKey]);\n' +
      '  useEffect(function(){ saveLocal("cria_fish_voice", fishVoiceId); }, [fishVoiceId]);\n' +
      '  useEffect(function(){ saveLocal("cria_fish_model", fishModel); }, [fishModel]);\n' +
      '  useEffect(function(){ saveLocal("cria_notif_on", criaNotifOn ? "1" : "0"); }, [criaNotifOn]);\n' +
      '  useEffect(function(){ saveLocal("cria_ping_on", criaPingOn ? "1" : "0"); }, [criaPingOn]);\n' +
      '  function criaLoadReminders(){ try { var a = JSON.parse(localStorage.getItem("cria_reminders") || "[]"); return Array.isArray(a) ? a : []; } catch(e){ return []; } }\n' +
      '  function criaSaveReminders(list){ try { localStorage.setItem("cria_reminders", JSON.stringify(list || [])); } catch(e){} }\n' +
      '  function criaNotify(title, body){ try { if (!criaNotifOn) return; if (!("Notification" in window)) return; if (Notification.permission === "granted") new Notification(title || "Cria", { body: body || "", tag: "cria-" + Date.now() }); } catch(e){} }\n' +
      '  function criaRequestNotif(){ if (!("Notification" in window)) return Promise.resolve("unsupported"); if (Notification.permission === "granted") return Promise.resolve("granted"); if (Notification.permission === "denied") return Promise.resolve("denied"); return Notification.requestPermission(); }\n' +
      '  function criaParseReminder(text){\n' +
      '    var t = String(text || "").toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");\n' +
      '    if (!/(lembr[ae]|me lembra|me avisa|alarme|reminder)/i.test(t)) return null;\n' +
      '    var now = Date.now(), when = null, note = text, m;\n' +
      '    if ((m = t.match(/em\\s+(\\d+)\\s*(min|minuto|minutos)/))) when = now + parseInt(m[1],10)*60000;\n' +
      '    else if ((m = t.match(/em\\s+(\\d+)\\s*(h|hr|hora|horas)/))) when = now + parseInt(m[1],10)*3600000;\n' +
      '    else if ((m = t.match(/em\\s+(\\d+)\\s*(s|seg|segundo|segundos)/))) when = now + parseInt(m[1],10)*1000;\n' +
      '    else if (/daqui\\s+a\\s+pouco/.test(t)) when = now + 15*60000;\n' +
      '    else if ((m = t.match(/(?:as|a)\\s*(\\d{1,2})(?::(\\d{2}))?/))) { var d=new Date(); d.setSeconds(0,0); d.setHours(parseInt(m[1],10), parseInt(m[2]||"0",10),0,0); if (/amanha/.test(t)) d.setDate(d.getDate()+1); if (d.getTime()<=now) d.setDate(d.getDate()+1); when=d.getTime(); }\n' +
      '    else if (/amanha/.test(t)) { var d2=new Date(); d2.setDate(d2.getDate()+1); d2.setHours(9,0,0,0); when=d2.getTime(); }\n' +
      '    if (!when) return null;\n' +
      '    note = text.replace(/me lembra[^,]*/i,"").replace(/lembr[ae]\\s*(de|que)?/i,"").trim();\n' +
      '    if (!note || note.length < 3) note = text;\n' +
      '    return { id: "r"+now+Math.random().toString(36).slice(2,7), when: when, note: note, text: text, done: false };\n' +
      '  }\n' +
      '  function criaAddReminder(rem){ var list=criaLoadReminders().filter(function(x){return !x.done && x.when>Date.now()-60000;}); list.push(rem); criaSaveReminders(list); return rem; }\n' +
      '  function criaFormatWhen(ts){ try { return new Date(ts).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}); } catch(e){ return String(ts); } }\n' +
      '  useEffect(function(){\n' +
      '    criaRequestNotif();\n' +
      '    var lastPing = parseInt(localStorage.getItem("cria_last_ping")||"0",10)||0;\n' +
      '    var iv = setInterval(function(){\n' +
      '      try {\n' +
      '        var list = criaLoadReminders(), now = Date.now(), changed=false;\n' +
      '        list.forEach(function(r){\n' +
      '          if (!r.done && r.when <= now) {\n' +
      '            r.done = true; changed = true;\n' +
      '            var msg = "\u23f0 Lembrete (" + criaFormatWhen(r.when) + ")|||vc me pediu pra lembrar: " + (r.note||r.text) + "|||bora resolver isso?";\n' +
      '            var parts = msg.split("|||");\n' +
      '            setMessages(function(prev){ var cur=prev.slice(); parts.forEach(function(p){ if(p.trim()) cur.push({role:"assistant",text:p.trim()}); }); return cur; });\n' +
      '            criaNotify("Cria \u00b7 lembrete", r.note || r.text || "Lembrete");\n' +
      '          }\n' +
      '        });\n' +
      '        if (changed) criaSaveReminders(list.filter(function(x){ return !x.done || x.when > now - 86400000; }));\n' +
      '        if (criaPingOn && mode === "chat" && !loading) {\n' +
      '          var idle = now - lastPing, gap = 45*60*1000;\n' +
      '          if (lastPing === 0) { lastPing = now; localStorage.setItem("cria_last_ping", String(now)); }\n' +
      '          else if (idle > gap && Math.random() < 0.15) {\n' +
      '            lastPing = now; localStorage.setItem("cria_last_ping", String(now));\n' +
      '            var pings = ["opa iae mn, t\u00e1 tudo bem?","e a\u00ed, sumiu? kkk","to aqui se precisar","oi\u2026 ainda a\u00ed?","passa um oii pro seu bem"];\n' +
      '            var pick = pings[Math.floor(Math.random()*pings.length)];\n' +
      '            setMessages(function(prev){ return prev.concat([{role:"assistant",text:pick}]); });\n' +
      '            criaNotify("Cria", pick);\n' +
      '          }\n' +
      '        }\n' +
      '      } catch(e){}\n' +
      '    }, 20000);\n' +
      '    return function(){ clearInterval(iv); };\n' +
      '  }, [criaNotifOn, criaPingOn, mode, loading]);\n'
    );

    if (html.indexOf('cria_fish_key_input') < 0 && html.indexOf('elevenlabs.io') >= 0) {
      html = html.replace(
        '<p style={styles.keyHint}>elevenlabs.io \u2192 Profile \u2192 API Key</p>',
        '<p style={styles.keyHint}>elevenlabs.io \u2192 Profile \u2192 API Key</p>\n' +
        '            <label style={styles.keyLabel}>Fish Audio API Key\n' +
        '              <input id="cria_fish_key_input" style={styles.keyInput} type="password" value={fishKey} onChange={function(e){ setFishKey(e.target.value); }} placeholder="fish.audio API key" />\n' +
        '            </label>\n' +
        '            <p style={styles.keyHint}>fish.audio \u2192 API Keys</p>\n' +
        '            <label style={styles.keyLabel}>Fish Voice ID (reference_id)\n' +
        '              <input style={styles.keyInput} value={fishVoiceId} onChange={function(e){ setFishVoiceId(e.target.value); }} placeholder="model/voice id" />\n' +
        '            </label>\n' +
        '            <p style={styles.keyHint}>Playground \u2192 copiar reference_id da voz</p>\n' +
        '            <label style={styles.keyLabel}>Fish Model\n' +
        '              <input style={styles.keyInput} value={fishModel} onChange={function(e){ setFishModel(e.target.value); }} placeholder="s2.1-pro-free" />\n' +
        '            </label>\n' +
        '            <label style={{ ...styles.keyLabel, display: "flex", alignItems: "center", gap: 8 }}>\n' +
        '              <input type="checkbox" checked={criaNotifOn} onChange={function(e){ setCriaNotifOn(e.target.checked); if(e.target.checked) criaRequestNotif(); }} />\n' +
        '              Notifica\u00e7\u00f5es do navegador (lembretes)\n' +
        '            </label>\n' +
        '            <label style={{ ...styles.keyLabel, display: "flex", alignItems: "center", gap: 8 }}>\n' +
        '              <input type="checkbox" checked={criaPingOn} onChange={function(e){ setCriaPingOn(e.target.checked); }} />\n' +
        '              Mensagens espont\u00e2neas (oi, sumiu?)\n' +
        '            </label>'
      );
      // also try without unicode arrow
      if (html.indexOf('cria_fish_key_input') < 0) {
        html = html.replace(
          '<p style={styles.keyHint}>elevenlabs.io',
          '<p style={styles.keyHint} data-fish="1">elevenlabs.io'
        );
        html = html.replace(
          '<p style={styles.keyHint} data-fish="1">elevenlabs.io',
          '<p style={styles.keyHint}>elevenlabs.io → Profile → API Key</p>\n' +
          '            <label style={styles.keyLabel}>Fish Audio API Key<input id="cria_fish_key_input" style={styles.keyInput} type="password" value={fishKey} onChange={function(e){ setFishKey(e.target.value); }} placeholder="API key" /></label>\n' +
          '            <label style={styles.keyLabel}>Fish Voice ID<input style={styles.keyInput} value={fishVoiceId} onChange={function(e){ setFishVoiceId(e.target.value); }} placeholder="reference_id" /></label>\n' +
          '            <label style={styles.keyLabel}>Fish Model<input style={styles.keyInput} value={fishModel} onChange={function(e){ setFishModel(e.target.value); }} placeholder="s2.1-pro-free" /></label>\n' +
          '            <label style={styles.keyLabel}><input type="checkbox" checked={criaNotifOn} onChange={function(e){ setCriaNotifOn(e.target.checked); if(e.target.checked) criaRequestNotif(); }} /> Notifica\u00e7\u00f5es</label>\n' +
          '            <label style={styles.keyLabel}><input type="checkbox" checked={criaPingOn} onChange={function(e){ setCriaPingOn(e.target.checked); }} /> Pings espont\u00e2neos</label>\n' +
          '            <p style={styles.keyHint}>elevenlabs.io'
        );
      }
    }

    if (html.indexOf('CRIA_FISH_SPEAK') < 0) {
      html = html.replace(
        'async function speakText(text) {\n    if (!text) return;\n    var ek = (elevenKey || "").trim();\n    var vid = (elevenVoiceId || "").trim();',
        'async function speakText(text) {\n    /* CRIA_FISH_SPEAK */\n    if (!text) return;\n' +
        '    var fk = (loadLocal("cria_fish_key","")||"").trim();\n' +
        '    var fvid = (loadLocal("cria_fish_voice","")||"").trim();\n' +
        '    var fmodel = (loadLocal("cria_fish_model","s2.1-pro-free")||"s2.1-pro-free");\n' +
        '    if (fk) {\n' +
        '      try {\n' +
        '        var body = { text: String(text).slice(0,2000), format: "mp3", normalize: true };\n' +
        '        if (fvid) body.reference_id = fvid;\n' +
        '        var fres = await fetch("https://api.fish.audio/v1/tts", { method:"POST", headers:{ "Authorization":"Bearer "+fk, "Content-Type":"application/json", "model": fmodel }, body: JSON.stringify(body) });\n' +
        '        if (fres.ok) {\n' +
        '          var fblob = await fres.blob(); var furl = URL.createObjectURL(fblob);\n' +
        '          await new Promise(function(resolve){ var audio=new Audio(furl); audio.onended=function(){URL.revokeObjectURL(furl);resolve();}; audio.onerror=function(){URL.revokeObjectURL(furl);resolve();}; audio.volume=0.95; audio.play().catch(function(){resolve();}); });\n' +
        '          return;\n' +
        '        }\n' +
        '      } catch(fe) { console.warn("fish tts", fe); }\n' +
        '    }\n' +
        '    var ek = (elevenKey || "").trim();\n' +
        '    var vid = (elevenVoiceId || "").trim();'
      );
    }

    if (html.indexOf('CRIA_REMINDER_CMD') < 0) {
      var remInject =
        '    /* CRIA_REMINDER_CMD */\n' +
        '    if (typeof criaParseReminder === "function") {\n' +
        '      var _rem = criaParseReminder(text);\n' +
        '      if (_rem) {\n' +
        '        criaAddReminder(_rem); criaRequestNotif();\n' +
        '        const nextMessages = [...messages, { role: "user", text }];\n' +
        '        setMessages(nextMessages); setInput("");\n' +
        '        var conf = "anotado \u23f0|||" + criaFormatWhen(_rem.when) + " eu te lembro: " + _rem.note + "|||pode deixar comigo";\n' +
        '        var parts = conf.split("|||");\n' +
        '        (async function(){ var cur=nextMessages.slice(); for(var i=0;i<parts.length;i++){ cur=cur.concat([{role:"assistant",text:parts[i]}]); setMessages(cur); if(i<parts.length-1) await new Promise(function(r){setTimeout(r,280);}); } })();\n' +
        '        return;\n' +
        '      }\n' +
        '    }\n';
      if (html.indexOf('CRIA_FF_CMD') >= 0) html = html.replace('/* CRIA_FF_CMD */', remInject + '    /* CRIA_FF_CMD */');
      else if (html.indexOf('CRIA_CHATPLUS_SEND') >= 0) html = html.replace('/* CRIA_CHATPLUS_SEND */', '/* CRIA_CHATPLUS_SEND */\n' + remInject);
      else html = html.replace('var text = input.trim();', 'var text = input.trim();\n' + remInject);
    }

  } catch (e) {
    console.warn('CRIA_PATCH_FISH_NOTIFY error', e);
  }
  return html;
};
