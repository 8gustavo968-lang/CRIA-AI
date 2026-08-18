window.CRIA_PATCH_VOICE = function(html) {
  try {
    // Pass getKey
    html = html.replace(
      '<VoiceCall messages={messages} setMessages={setMessages} askCria={askCria} voiceGender={voiceGender} />',
      '<VoiceCall messages={messages} setMessages={setMessages} askCria={askCria} voiceGender={voiceGender} getKey={getKey} />'
    );

    // Signature
    html = html.replace(
      'function VoiceCall({ messages, setMessages, askCria, voiceGender }) {',
      'function VoiceCall({ messages, setMessages, askCria, voiceGender, getKey }) {'
    );

    // Speak function
    var oldSpeak = "  function speak(text) {\n    return new Promise((resolve) => {\n      if (!window.speechSynthesis) {\n        resolve();\n        return;\n      }\n      window.speechSynthesis.cancel();\n      const chunks = text.split(/(?<=[.!?…])\\s+/).map((s) => s.trim()).filter(Boolean);\n      if (chunks.length === 0) {\n        resolve();\n        return;\n      }\n      setVstate(VSTATE.SPEAKING);\n      bargeArmedRef.current = true;\n      let i = 0;\n      const voice = pickVoice();\n\n      function speakNext() {\n        if (i >= chunks.length || !activeRef.current) {\n          bargeArmedRef.current = false;\n          resolve();\n          return;\n        }\n        const utter = new SpeechSynthesisUtterance(chunks[i]);\n        if (voice) utter.voice = voice;\n        utter.lang = \"pt-BR\";\n        utter.rate = 0.98 + Math.random() * 0.07;\n        utter.pitch = 1.0 + Math.random() * 0.06;\n        utter.onboundary = (ev) => {\n          if (ev.name === \"word\") setLevel(0.4 + Math.random() * 0.6);\n        };\n        utter.onend = () => {\n          i += 1;\n          speakNext();\n        };\n        utter.onerror = () => {\n          i += 1;\n          speakNext();\n        };\n        window.speechSynthesis.speak(utter);\n      }\n      speakNext();\n    });\n  }\n\n";
    var newSpeak = "  async function speak(text) {\n    setVstate(VSTATE.SPEAKING);\n    bargeArmedRef.current = true;\n\n    // 1) Tenta voz realista da OpenAI (se tiver chave)\n    const openaiKey = (typeof getKey === \"function\" ? getKey(\"openai\") : \"\") || \"\";\n    if (openaiKey) {\n      try {\n        const voiceName = voiceGender === \"masculina\" ? \"onyx\" : \"nova\";\n        const res = await fetch(\"https://api.openai.com/v1/audio/speech\", {\n          method: \"POST\",\n          headers: {\n            \"Authorization\": \"Bearer \" + openaiKey,\n            \"Content-Type\": \"application/json\",\n          },\n          body: JSON.stringify({\n            model: \"tts-1\",\n            input: text,\n            voice: voiceName,\n            response_format: \"mp3\",\n            speed: 0.92,\n          }),\n        });\n        if (res.ok) {\n          const blob = await res.blob();\n          const url = URL.createObjectURL(blob);\n          await new Promise((resolve) => {\n            const audio = new Audio(url);\n            audio.onended = () => { URL.revokeObjectURL(url); resolve(); };\n            audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };\n            audio.volume = 0.85;\n            audio.play().catch(() => resolve());\n          });\n          bargeArmedRef.current = false;\n          return;\n        }\n      } catch (e) {\n        console.warn(\"OpenAI TTS falhou, caindo pro navegador\", e);\n      }\n    }\n\n    // 2) Fallback: voz do navegador mais fofinha e baixinha\n    return new Promise((resolve) => {\n      if (!window.speechSynthesis) {\n        bargeArmedRef.current = false;\n        resolve();\n        return;\n      }\n      window.speechSynthesis.cancel();\n      const chunks = text.split(/(?<=[.!?…])\\s+/).map((s) => s.trim()).filter(Boolean);\n      if (chunks.length === 0) {\n        bargeArmedRef.current = false;\n        resolve();\n        return;\n      }\n      let i = 0;\n      const voice = pickVoice();\n\n      function speakNext() {\n        if (i >= chunks.length || !activeRef.current) {\n          bargeArmedRef.current = false;\n          resolve();\n          return;\n        }\n        const utter = new SpeechSynthesisUtterance(chunks[i]);\n        if (voice) utter.voice = voice;\n        utter.lang = \"pt-BR\";\n        utter.rate = 0.88 + Math.random() * 0.06;\n        utter.pitch = voiceGender === \"feminina\" ? 1.12 + Math.random() * 0.08 : 0.95;\n        utter.volume = 0.75;\n        utter.onboundary = (ev) => {\n          if (ev.name === \"word\") setLevel(0.4 + Math.random() * 0.6);\n        };\n        utter.onend = () => {\n          i += 1;\n          speakNext();\n        };\n        utter.onerror = () => {\n          i += 1;\n          speakNext();\n        };\n        window.speechSynthesis.speak(utter);\n      }\n      speakNext();\n    });\n  }\n\n";
    if (html.indexOf(oldSpeak) >= 0) {
      html = html.replace(oldSpeak, newSpeak);
    } else {
      console.warn("CRIA_PATCH_VOICE: speak block not found");
    }
  } catch (e) {
    console.warn("CRIA_PATCH_VOICE error", e);
  }
  return html;
};
