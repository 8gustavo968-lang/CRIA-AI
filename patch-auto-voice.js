window.CRIA_PATCH_AUTO_VOICE = function(html) {
  try {
    if (html.indexOf('CRIA_SPEAK_V2') >= 0) return html;

    // --- Após resposta (multi partes do patch.js) ---
    if (html.indexOf('_speakAll') < 0) {
      var multiEnd =
        'userTurnCountRef.current += 1;\n' +
        '      if (userTurnCountRef.current % 3 === 0) updateProfile(current);';
      if (html.indexOf(multiEnd) >= 0) {
        html = html.replace(
          multiEnd,
          multiEnd +
          '\n      if (window.__criaFromMic) {\n' +
          '        window.__criaFromMic = false;\n' +
          '        var _speakAll = (parts || []).join(". ");\n' +
          '        setTimeout(function(){ try { window.CRIA_SPEAK && window.CRIA_SPEAK(_speakAll); } catch(e){} }, 200);\n' +
          '      }'
        );
      }
    }

    if (html.indexOf('detail: { text: replyText') < 0 && html.indexOf('_speakAll') < 0) {
      var simpleEnd =
        'userTurnCountRef.current += 1;\n' +
        '      if (userTurnCountRef.current % 3 === 0) updateProfile(finalMessages);';
      if (html.indexOf(simpleEnd) >= 0) {
        html = html.replace(
          simpleEnd,
          simpleEnd +
          '\n      if (window.__criaFromMic) {\n' +
          '        window.__criaFromMic = false;\n' +
          '        setTimeout(function(){ try { window.CRIA_SPEAK && window.CRIA_SPEAK(replyText); } catch(e){} }, 200);\n' +
          '      }'
        );
      }
    }

    // Garante que qualquer caminho antigo também chame CRIA_SPEAK
    html = html.replace(
      /window\.dispatchEvent\(new CustomEvent\("cria-speak", \{ detail: \{ text: (_speakAll|replyText) \} \}\)\);/g,
      'window.CRIA_SPEAK && window.CRIA_SPEAK($1);'
    );

    // --- Substitui speakText por versão que SEMPRE lê as chaves salvas ---
    var newSpeak =
      'async function speakText(text, opts) {\n' +
      '    if (!text) return;\n' +
      '    var t = String(text).replace(/🔊/g, "").trim();\n' +
      '    if (!t) return;\n' +
      '    // Lê as MESMAS chaves do botão 🔊 (state + localStorage)\n' +
      '    function loadK(k, d) { try { var v = localStorage.getItem(k); return v != null ? v : (d || ""); } catch(e) { return d || ""; } }\n' +
      '    var ek = (elevenKey || loadK("cria_eleven_key") || "").trim();\n' +
      '    var vid = (elevenVoiceId || loadK("cria_eleven_voice_id") || "KLKAEnKiSW8hC8KcEv8o").trim();\n' +
      '    var gender = voiceGender || loadK("cria_voice_gender", "feminina");\n' +
      '    var low = t.toLowerCase();\n' +
      '    var emotion = "neutral";\n' +
      '    if (/[!]|haha|kk+|rs+|que legal|demais|top|amo|adorei/.test(low)) emotion = "happy";\n' +
      '    else if (/nossa|serio|sério|mentira|uau|wow|\\?\\?/.test(low)) emotion = "surprise";\n' +
      '    else if (/triste|puxa|que pena|sinto muito|desculpa/.test(low)) emotion = "sad";\n' +
      '    else if (/calma|tranquilo|respira|tudo bem/.test(low)) emotion = "calm";\n' +
      '    var style = 0.55, stability = 0.28, rate = 0.95, pitch = 1.12;\n' +
      '    if (emotion === "happy") { style = 0.72; stability = 0.22; rate = 1.05; pitch = 1.22; }\n' +
      '    if (emotion === "surprise") { style = 0.7; stability = 0.2; rate = 1.08; pitch = 1.25; }\n' +
      '    if (emotion === "sad") { style = 0.35; stability = 0.45; rate = 0.82; pitch = 0.95; }\n' +
      '    if (emotion === "calm") { style = 0.3; stability = 0.5; rate = 0.88; pitch = 1.05; }\n' +
      '    if (gender !== "feminina") pitch = Math.max(0.85, pitch - 0.15);\n' +
      '    // 1) ElevenLabs com a chave que já funciona no 🔊\n' +
      '    if (ek && vid) {\n' +
      '      try {\n' +
      '        var res = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + vid, {\n' +
      '          method: "POST",\n' +
      '          headers: { "Accept": "audio/mpeg", "Content-Type": "application/json", "xi-api-key": ek },\n' +
      '          body: JSON.stringify({\n' +
      '            text: t,\n' +
      '            model_id: "eleven_multilingual_v2",\n' +
      '            voice_settings: { stability: stability, similarity_boost: 0.8, style: style, use_speaker_boost: true }\n' +
      '          })\n' +
      '        });\n' +
      '        if (res.ok) {\n' +
      '          var blob = await res.blob();\n' +
      '          var url = URL.createObjectURL(blob);\n' +
      '          var audio = window.__criaAudioEl || new Audio();\n' +
      '          window.__criaAudioEl = audio;\n' +
      '          try { audio.pause(); } catch(e) {}\n' +
      '          audio.src = url;\n' +
      '          audio.volume = 0.95;\n' +
      '          await audio.play();\n' +
      '          await new Promise(function(resolve) {\n' +
      '            audio.onended = function() { try { URL.revokeObjectURL(url); } catch(e){} resolve(); };\n' +
      '            audio.onerror = function() { resolve(); };\n' +
      '          });\n' +
      '          return;\n' +
      '        } else {\n' +
      '          console.warn("ElevenLabs HTTP", res.status);\n' +
      '        }\n' +
      '      } catch (e) { console.warn("ElevenLabs falhou", e); }\n' +
      '    }\n' +
      '    // 2) Fallback voz do navegador\n' +
      '    if (!window.speechSynthesis) return;\n' +
      '    window.speechSynthesis.cancel();\n' +
      '    var utter = new SpeechSynthesisUtterance(t);\n' +
      '    utter.lang = "pt-BR";\n' +
      '    utter.rate = rate;\n' +
      '    utter.pitch = pitch;\n' +
      '    utter.volume = 0.9;\n' +
      '    try {\n' +
      '      var voices = window.speechSynthesis.getVoices() || [];\n' +
      '      var pt = voices.filter(function(v){ return v.lang && v.lang.indexOf("pt") === 0; });\n' +
      '      var prefer = null;\n' +
      '      for (var vi = 0; vi < pt.length; vi++) {\n' +
      '        var n = (pt[vi].name || "").toLowerCase();\n' +
      '        if (gender === "feminina" && /female|mulher|luciana|maria|vitoria|camila|fernanda|google/.test(n)) { prefer = pt[vi]; break; }\n' +
      '        if (gender !== "feminina" && /male|homem|daniel|felipe|ricardo/.test(n)) { prefer = pt[vi]; break; }\n' +
      '      }\n' +
      '      if (!prefer && pt[0]) prefer = pt[0];\n' +
      '      if (prefer) utter.voice = prefer;\n' +
      '    } catch(e){}\n' +
      '    window.speechSynthesis.speak(utter);\n' +
      '  }\n' +
      '  // CRIA_SPEAK_V2\n' +
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

    var replaced = false;
    if (/async function speakText\(text(?:, opts)?\) \{/.test(html)) {
      var re = /async function speakText\(text(?:, opts)?\) \{[\s\S]*?window\.speechSynthesis\.speak\(utter\);\n  \}/;
      if (re.test(html)) {
        html = html.replace(re, newSpeak);
        replaced = true;
      } else {
        // tenta até speakChunk
        re = /async function speakText\(text(?:, opts)?\) \{[\s\S]*?speakChunk\(0\);\n  \}/;
        if (re.test(html)) {
          html = html.replace(re, newSpeak);
          replaced = true;
        }
      }
    }

    if (!replaced && html.indexOf('window.CRIA_SPEAK') < 0) {
      // anexa no fim do ChatView speak se existir botão 🔊
      html = html.replace(
        'title="Ouvir"',
        'title="Ouvir"'
      );
    }

  } catch (e) {
    console.warn('CRIA_PATCH_AUTO_VOICE error', e);
  }
  return html;
};
