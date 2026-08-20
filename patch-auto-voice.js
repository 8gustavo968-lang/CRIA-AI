window.CRIA_PATCH_AUTO_VOICE = function(html) {
  try {
    if (html.indexOf('cria-auto-voice') >= 0) return html;

    // 1) Marca turno de microfone no onSend do mic (se ainda estiver o padrão antigo)
    html = html.replace(
      'try { onSend(null, t); } catch(e) {}',
      'try { window.__criaFromMic = true; onSend(null, t); } catch(e) {}'
    );

    // 2) Depois da resposta da IA, se veio do mic → fala em voz alta
    // Cobre bloco multi-mensagem (patch.js)
    var multiEnd =
      'userTurnCountRef.current += 1;\n' +
      '      if (userTurnCountRef.current % 3 === 0) updateProfile(current);';

    var multiEndWithSpeak =
      'userTurnCountRef.current += 1;\n' +
      '      if (userTurnCountRef.current % 3 === 0) updateProfile(current);\n' +
      '      if (window.__criaFromMic) {\n' +
      '        window.__criaFromMic = false;\n' +
      '        var _speakAll = parts.join(". ");\n' +
      '        setTimeout(function(){ try { window.dispatchEvent(new CustomEvent("cria-speak", { detail: { text: _speakAll } })); } catch(e){} }, 300);\n' +
      '      }';

    if (html.indexOf(multiEnd) >= 0 && html.indexOf('cria-speak') < 0) {
      html = html.replace(multiEnd, multiEndWithSpeak);
    }

    // Cobre bloco original simples
    var simpleEnd =
      'userTurnCountRef.current += 1;\n' +
      '      if (userTurnCountRef.current % 3 === 0) updateProfile(finalMessages);';

    var simpleEndWithSpeak =
      'userTurnCountRef.current += 1;\n' +
      '      if (userTurnCountRef.current % 3 === 0) updateProfile(finalMessages);\n' +
      '      if (window.__criaFromMic) {\n' +
      '        window.__criaFromMic = false;\n' +
      '        setTimeout(function(){ try { window.dispatchEvent(new CustomEvent("cria-speak", { detail: { text: replyText } })); } catch(e){} }, 300);\n' +
      '      }';

    if (html.indexOf(simpleEnd) >= 0 && html.indexOf('detail: { text: replyText') < 0) {
      html = html.replace(simpleEnd, simpleEndWithSpeak);
    }

    // 3) Melhora speakText: mais expressivo + escuta evento cria-speak
    // Substitui a função speakText gerada pelo patch-voice, se existir
    var oldSpeakStart = 'async function speakText(text) {\n    if (!text) return;';
    if (html.indexOf(oldSpeakStart) >= 0) {
      var newSpeak =
        'async function speakText(text, opts) {\n' +
        '    if (!text) return;\n' +
        '    opts = opts || {};\n' +
        '    // Detecta sentimento pelo texto\n' +
        '    var t = String(text);\n' +
        '    var low = t.toLowerCase();\n' +
        '    var emotion = "neutral";\n' +
        '    if (/[!]{1,}|haha|kk+|rs+|😂|😄|🤣|que legal|demais|top|amo|adorei/.test(low)) emotion = "happy";\n' +
        '    else if (/\?{2,}|nossa|sério|serio|mentira|uau|wow/.test(low)) emotion = "surprise";\n' +
        '    else if (/triste|puxa|que pena|sinto muito|desculpa|😔|😢/.test(low)) emotion = "sad";\n' +
        '    else if (/calma|tranquilo|respira|tudo bem|fica em paz/.test(low)) emotion = "calm";\n' +
        '    else if (/cuidado|atenção|atencao|importante|alerta/.test(low)) emotion = "serious";\n' +
        '    // Ajustes de expressividade\n' +
        '    var style = 0.55, stability = 0.28, rate = 0.92, pitch = 1.12;\n' +
        '    if (emotion === "happy") { style = 0.72; stability = 0.22; rate = 1.02; pitch = 1.22; }\n' +
        '    if (emotion === "surprise") { style = 0.7; stability = 0.2; rate = 1.05; pitch = 1.25; }\n' +
        '    if (emotion === "sad") { style = 0.35; stability = 0.45; rate = 0.82; pitch = 0.95; }\n' +
        '    if (emotion === "calm") { style = 0.3; stability = 0.5; rate = 0.88; pitch = 1.05; }\n' +
        '    if (emotion === "serious") { style = 0.4; stability = 0.4; rate = 0.9; pitch = 1.0; }\n' +
        '    if (voiceGender !== "feminina") pitch = Math.max(0.85, pitch - 0.15);\n' +
        '    // 1) ElevenLabs expressivo\n' +
        '    var ek = (elevenKey || "").trim();\n' +
        '    var vid = (elevenVoiceId || "").trim();\n' +
        '    if (ek && vid) {\n' +
        '      try {\n' +
        '        var res = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + vid, {\n' +
        '          method: "POST",\n' +
        '          headers: {\n' +
        '            "Accept": "audio/mpeg",\n' +
        '            "Content-Type": "application/json",\n' +
        '            "xi-api-key": ek\n' +
        '          },\n' +
        '          body: JSON.stringify({\n' +
        '            text: t,\n' +
        '            model_id: "eleven_multilingual_v2",\n' +
        '            voice_settings: { stability: stability, similarity_boost: 0.78, style: style, use_speaker_boost: true }\n' +
        '          })\n' +
        '        });\n' +
        '        if (res.ok) {\n' +
        '          var blob = await res.blob();\n' +
        '          var url = URL.createObjectURL(blob);\n' +
        '          await new Promise(function(resolve) {\n' +
        '            var audio = new Audio(url);\n' +
        '            audio.onended = function() { URL.revokeObjectURL(url); resolve(); };\n' +
        '            audio.onerror = function() { URL.revokeObjectURL(url); resolve(); };\n' +
        '            audio.volume = 0.92;\n' +
        '            audio.play().catch(function(){ resolve(); });\n' +
        '          });\n' +
        '          return;\n' +
        '        }\n' +
        '      } catch (e) { console.warn("ElevenLabs falhou", e); }\n' +
        '    }\n' +
        '    // 2) Fallback navegador com emoção\n' +
        '    if (!window.speechSynthesis) return;\n' +
        '    window.speechSynthesis.cancel();\n' +
        '    // Quebra em frases pra soar mais natural\n' +
        '    var chunks = t.split(/(?<=[.!?…])\s+/).filter(function(s){ return s.trim(); });\n' +
        '    if (!chunks.length) chunks = [t];\n' +
        '    function speakChunk(i) {\n' +
        '      if (i >= chunks.length) return;\n' +
        '      var utter = new SpeechSynthesisUtterance(chunks[i]);\n' +
        '      utter.lang = "pt-BR";\n' +
        '      utter.rate = rate + (Math.random() * 0.04 - 0.02);\n' +
        '      utter.pitch = pitch + (Math.random() * 0.06 - 0.03);\n' +
        '      utter.volume = 0.85;\n' +
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
        '      utter.onend = function() { setTimeout(function(){ speakChunk(i + 1); }, 120); };\n' +
        '      window.speechSynthesis.speak(utter);\n' +
        '    }\n' +
        '    speakChunk(0);\n' +
        '  }\n' +
        '  // escuta fala automática (cria-auto-voice)\n' +
        '  useEffect(function() {\n' +
        '    function onCriaSpeak(ev) {\n' +
        '      var tx = ev && ev.detail && ev.detail.text;\n' +
        '      if (tx) speakText(tx, { auto: true });\n' +
        '    }\n' +
        '    window.addEventListener("cria-speak", onCriaSpeak);\n' +
        '    return function() { window.removeEventListener("cria-speak", onCriaSpeak); };\n' +
        '  }, [elevenKey, elevenVoiceId, voiceGender]);';

      // Replace from async function speakText until end of old function (before next function or return)
      html = html.replace(
        /async function speakText\(text\) \{[\s\S]*?window\.speechSynthesis\.speak\(utter\);\n  \}/,
        newSpeak
      );
    }

  } catch (e) {
    console.warn('CRIA_PATCH_AUTO_VOICE error', e);
  }
  return html;
};
