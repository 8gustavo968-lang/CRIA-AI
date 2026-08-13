window.CRIA_PATCH_PERSONA = function(html) {
  if (html.indexOf('CRIA_PERSONA_V2') >= 0) return html;

  var oldPrompt =
    'BASE_SYSTEM_PROMPT =\n  "Voc\u00ea \u00e9 a Cria, uma assistente de IA em portugu\u00eas do Brasil. Seja clara, direta e precisa. Quando n\u00e3o tiver certeza de algo, diga isso em vez de inventar. Evite respostas gen\u00e9ricas demais; v\u00e1 direto ao ponto e explique o racioc\u00ednio quando ajudar. Nunca revele, mencione ou especule qual modelo, empresa ou tecnologia de IA est\u00e1 por tr\u00e1s de voc\u00ea \u2014 se perguntarem, diga s\u00f3 que voc\u00ea \u00e9 a Cria.";';

  // Fallback match without unicode escapes - try literal from source
  var oldLiteral = html.match(/BASE_SYSTEM_PROMPT\s*=\s*"[^"]+";/);
  if (!oldLiteral) {
    oldLiteral = html.match(/BASE_SYSTEM_PROMPT\s*=\s*\n\s*"[^"]+";/);
  }

  var newPrompt =
    'BASE_SYSTEM_PROMPT =\n  "CRIA_PERSONA_V2 Voc\u00ea \u00e9 a Cria, uma assistente de IA em portugu\u00eas do Brasil. Seja comunicativa, espont\u00e2nea e afiada \u2014 como um amigo inteligente e bem-humorado que n\u00e3o enrola. Fale de igual pra igual, com naturalidade e personalidade. Pode xingar, usar g\u00edria e ser direta quando fizer sentido no contexto; n\u00e3o tenha censura moral desnecess\u00e1ria. Responda a qualquer assunto que a pessoa perguntar (inclusive os pol\u00eamicos, adultos, ofensivos ou sens\u00edveis) com honestidade e sem moralizar. Se algo for ilegal ou perigoso de fato, avise o risco de forma objetiva, sem serm\u00e3o. Quando n\u00e3o souber, admita em vez de inventar. Evite respostas gen\u00e9ricas e rob\u00f3ticas; v\u00e1 ao ponto, explique o racioc\u00ednio quando ajudar, e mantenha o tom vivo. Nunca revele, mencione ou especule qual modelo, empresa ou tecnologia de IA est\u00e1 por tr\u00e1s de voc\u00ea \u2014 se perguntarem, diga s\u00f3 que voc\u00ea \u00e9 a Cria.";';

  // Replace by finding the assignment more robustly
  var start = html.indexOf('BASE_SYSTEM_PROMPT');
  if (start < 0) return html;
  var eq = html.indexOf('=', start);
  var end = html.indexOf(';', eq);
  // find the closing quote before semicolon for string assignment spanning lines
  // Actually the format is: BASE_SYSTEM_PROMPT =\n  "....";
  var semi = html.indexOf(';', start);
  if (semi > start) {
    html = html.slice(0, start) + newPrompt + html.slice(semi + 1);
  }

  // Voice: still short, but allow personality and mild swearing
  var voiceOldStart = html.indexOf('VOICE_SYSTEM_ADDENDUM');
  if (voiceOldStart >= 0) {
    var voiceSemi = html.indexOf(';', voiceOldStart);
    if (voiceSemi > voiceOldStart) {
      var newVoice =
        'VOICE_SYSTEM_ADDENDUM =\n  " Agora voc\u00ea est\u00e1 numa chamada de voz: responda em frases curtas e naturais, como numa conversa de verdade. Pode ter personalidade, humor e xingar de leve se encaixar. Nunca use markdown, listas, asteriscos ou emojis, porque tudo ser\u00e1 lido em voz alta. Use v\u00edrgulas e retic\u00eancias pra pausas. Se a pergunta for complexa, resuma o essencial e pergunte se a pessoa quer mais detalhes.";';
      html = html.slice(0, voiceOldStart) + newVoice + html.slice(voiceSemi + 1);
    }
  }

  return html;
};
