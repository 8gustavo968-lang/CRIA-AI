window.CRIA_PATCH_AUTO_VOICE = function(html) {
  try {
    // idempotente parcial: se já tem o listener novo, ok
    if (html.indexOf('CRIA_SPEAK_READY') >= 0) return html;

    // 1) Após resposta da IA (multi)
    var multiEnd =
      'userTurnCountRef.current += 1;\n' +
      '      if (userTurnCountRef.current % 3 === 0) updateProfile(current);';

    if (html.indexOf(multiEnd) >= 0 && html.indexOf('_speakAll') < 0) {
      html = html.replace(
        multiEnd,
        multiEnd +
        '\n      if (window.__criaFromMic) {\n' +
        '        window.__criaFromMic = false;\n' +
        '        var _speakAll = parts.join(". ");\n' +
        '        setTimeout(function(){ try { if (window.CRIA_SPEAK) window.CRIA_SPEAK(_speakAll); else window.dispatchEvent(new CustomEvent("cria-speak", { detail: { text: _speakAll } })); } catch(e){} }, 250);\n' +
        '      }'
      );
    } else if (html.indexOf('_speakAll') >= 0) {
      // reforça chamada CRIA_SPEAK se já tinha só o evento
      html = html.replace(
        'window.dispatchEvent(new CustomEvent("cria-speak", { detail: { text: _speakAll } }));',
        'if (window.CRIA_SPEAK) window.CRIA_SPEAK(_speakAll); else window.dispatchEvent(new CustomEvent("cria-speak", { detail: { text: _speakAll } }));'
      );
    }

    // 2) Bloco simples
    var simpleEnd =
      'userTurnCountRef.current += 1;\n' +
      '      if (userTurnCountRef.current % 3 === 0) updateProfile(finalMessages);';
    if (html.indexOf(simpleEnd) >= 0 && html.indexOf('detail: { text: replyText') < 0 && html.indexOf('_speakAll') < 0) {
      html = html.replace(
        simpleEnd,
        simpleEnd +
        '\n      if (window.__criaFromMic) {\n' +
        '        window.__criaFromMic = false;\n' +
        '        setTimeout(function(){ try { if (window.CRIA_SPEAK) window.CRIA_SPEAK(replyText); else window.dispatchEvent(new CustomEvent("cria-speak", { detail: { text: replyText } })); } catch(e){} }, 250);\n' +
        '      }'
      );
    }

    // 3) speakText expressivo + CRIA_SPEAK global
    var oldSpeakRe = /async function speakText\(text(?:, opts)?\) \{[\s\S]*?(?:window\.speechSynthesis\.speak\(utter\);|speakChunk\(0\);)\n  \}/;

    var newSpeak =
      'async function speakText(text, opts) {\n' +
      '    if (!text) return;\n' +
      '    opts = opts || {};\n' +
      '    var t = String(text).replace(/\\s*🔊\\s*/g, " ").trim();\n' +
      '    if (!t) return;\n' +
      '    var low = t.toLowerCase();\n' +
      '    var emotion = "neutral";\n' +
      '    if (/[!！]|haha|kk+|rs+|que legal|demais|top|amo|adorei|😊|😄|😂/.test(low)) emotion = "happy";\n' +
      '    else if (/\\?\\?|nossa|serio|sério|mentira|uau|wow/.test(low)) emotion = "surprise";\n' +
      '    else if (/triste|puxa|que pena|sinto muito|desculpa|😔|😢/.test(low)) emotion = "sad";\n' +
      '    else if (/calma|tranquilo|respira|tudo bem/.test(low)) emotion = "calm";\n' +
      '    else if (/cuidado|atenção|atencao|importante|alerta/.test(low)) emotion = "serious";\n' +
      '    var style = 0.55, stability = 0.28, rate = 0.95, pitch = 1.12;\n' +
      '    if (emotion === "happy") { style = 0.72; stability = 0.22; rate = 1.05; pitch = 1.22; }\n' +
      '    if (emotion === "surprise") { style = 0.7; stability = 0.2; rate = 1.08; pitch = 1.25; }\n' +
      '    if (emotion === "sad") { style = 0.35; stability = 0.45; rate = 0.82; pitch = 0.95; }\n' +
      '    if (emotion === "calm") { style = 0.3; stability = 0.5; rate = 0.88; pitch = 1.05; }\n' +
      '    if (emotion === "serious") { style = 0.4; stability = 0.4; rate = 0.9; pitch = 1.0; }\n' +
      '    if (voiceGender !== "feminina") pitch = Math.max(0.85, pitch - 0.15);\n' +
      '    var ek = (elevenKey || "").trim();\n' +
      '    var vid = (elevenVoiceId || "").trim();\n' +
      '    if (ek && vid) {\n' +
      '      try {\n' +
      '        var res = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + vid + "?optimize_streaming_latency=2", {\n' +
      '          method: "POST",\n' +
      '          headers: { "Accept": "audio/mpeg", "Content-Type": "application/json", "xi-api-key": ek },\n' +
      '          body: JSON.stringify({\n' +
      '            text: t,\n' +
      '            model_id: "eleven_multilingual_v2",\n' +
      '            voice_settings: { stability: stability, similarity_boost: 0.78, style: style, use_speaker_boost: true }\n' +
      '          })\n' +
      '        });\n' +
      '        if (res.ok) {\n' +
      '          var blob = await res.blob();\n' +
      '          var url = URL.createObjectURL(blob);\n' +
      '          var audio = window.__criaAudioEl || new Audio();\n' +
      '          window.__criaAudioEl = audio;\n' +
      '          audio.src = url;\n' +
      '          audio.volume = 0.95;\n' +
      '          await audio.play().catch(function(){});\n' +
      '          await new Promise(function(resolve) {\n' +
      '            audio.onended = function() { URL.revokeObjectURL(url); resolve(); };\n' +
      '            audio.onerror = function() { URL.revokeObjectURL(url); resolve(); };\n' +
      '          });\n' +
      '          return;\n' +
      '        }\n' +
      '      } catch (e) { console.warn("ElevenLabs falhou", e); }\n' +
      '    }\n' +
      '    if (!window.speechSynthesis) return;\n' +
      '    window.speechSynthesis.cancel();\n' +
      '    var chunks = t.split(/(?<=[.!?…])\\s+/).filter(function(s){ return s.trim(); });\n' +
      '    if (!chunks.length) chunks = [t];\n' +
      '    function speakChunk(i) {\n' +
      '      if (i >= chunks.length) return;\n' +
      '      var utter = new SpeechSynthesisUtterance(chunks[i]);\n' +
      '      utter.lang = "pt-BR";\n' +
      '      utter.rate = rate;\n' +
      '      utter.pitch = pitch;\n' +
      '      utter.volume = 0.9;\n' +
      '      try {\n' +
      '        var voices = window.speechSynthesis.getVoices() || [];\n' +
      '        var pt = voices.filter(function(v){ return v.lang && v.lang.indexOf("pt") === 0; });\n' +
      '        var prefer = null;\n' +
      '        for (var vi = 0; vi < pt.length; vi++) {\n' +
      '          var n = (pt[vi].name || "").toLowerCase();\n' +
      '          if (voiceGender === "feminina" && /female|mulher|luciana|maria|vitoria|camila|fernanda|google/.test(n)) { prefer = pt[vi]; break; }\n' +
      '          if (voiceGender !== "feminina" && /male|homem|daniel|felipe|ricardo/.test(n)) { prefer = pt[vi]; break; }\n' +
      '        }\n' +
      '        if (!prefer && pt[0]) prefer = pt[0];\n' +
      '        if (prefer) utter.voice = prefer;\n' +
      '      } catch(e){}\n' +
      '      utter.onend = function() { setTimeout(function(){ speakChunk(i + 1); }, 90); };\n' +
      '      window.speechSynthesis.speak(utter);\n' +
      '    }\n' +
      '    speakChunk(0);\n' +
      '  }\n' +
      '  // CRIA_SPEAK_READY: expõe falante global pro sendMessage\n' +
      '  window.CRIA_SPEAK = function(tx) { try { speakText(tx, { auto: true }); } catch(e) { console.warn(e); } };\n' +
      '  useEffect(function() {\n' +
      '    window.CRIA_SPEAK = function(tx) { try { speakText(tx, { auto: true }); } catch(e) {} };\n' +
      '    function onCriaSpeak(ev) {\n' +
      '      var tx = ev && ev.detail && ev.detail.text;\n' +
      '      if (tx) speakText(tx, { auto: true });\n' +
      '    }\n' +
      '    window.addEventListener("cria-speak", onCriaSpeak);\n' +
      '    return function() { window.removeEventListener("cria-speak", onCriaSpeak); };\n' +
      '  }, [elevenKey, elevenVoiceId, voiceGender]);';

    if (oldSpeakRe.test(html)) {
      html = html.replace(oldSpeakRe, newSpeak);
    } else if (html.indexOf('async function speakText') >= 0 && html.indexOf('CRIA_SPEAK_READY') < 0) {
      // fallback: injeta CRIA_SPEAK depois do speakText existente
      html = html.replace(
        'window.speechSynthesis.speak(utter);\n  }',
        'window.speechSynthesis.speak(utter);\n  }\n  window.CRIA_SPEAK = function(tx) { try { speakText(tx); } catch(e) {} };\n  useEffect(function() {\n    window.CRIA_SPEAK = function(tx) { try { speakText(tx); } catch(e) {} };\n    function onCriaSpeak(ev) { var tx = ev && ev.detail && ev.detail.text; if (tx) speakText(tx); }\n    window.addEventListener("cria-speak", onCriaSpeak);\n    return function() { window.removeEventListener("cria-speak", onCriaSpeak); };\n  }, [elevenKey, elevenVoiceId, voiceGender]);'
      );
    }

  } catch (e) {
    console.warn('CRIA_PATCH_AUTO_VOICE error', e);
  }
  return html;
};
