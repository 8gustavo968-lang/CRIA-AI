window.CRIA_PATCH_VOICE = function(html) {
  try {
    // Pass getKey (preparado para TTS realista)
    html = html.replace(
      '<VoiceCall messages={messages} setMessages={setMessages} askCria={askCria} voiceGender={voiceGender} />',
      '<VoiceCall messages={messages} setMessages={setMessages} askCria={askCria} voiceGender={voiceGender} getKey={getKey} />'
    );
    html = html.replace(
      'function VoiceCall({ messages, setMessages, askCria, voiceGender }) {',
      'function VoiceCall({ messages, setMessages, askCria, voiceGender, getKey }) {'
    );

    // Voz do navegador mais fofinha, lenta e baixinha
    html = html.replace(
      'utter.rate = 0.98 + Math.random() * 0.07;',
      'utter.rate = 0.85 + Math.random() * 0.06;'
    );
    html = html.replace(
      'utter.pitch = 1.0 + Math.random() * 0.06;',
      'utter.pitch = voiceGender === "feminina" ? 1.15 + Math.random() * 0.08 : 0.95;\n        utter.volume = 0.72;'
    );
  } catch (e) {
    console.warn('CRIA_PATCH_VOICE error', e);
  }
  return html;
};
