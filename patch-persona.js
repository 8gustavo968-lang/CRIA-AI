window.CRIA_PATCH_PERSONA = function(html) {
  function replaceStringConst(html, name, newValue) {
    var start = html.indexOf(name);
    if (start < 0) return html;
    var eq = html.indexOf('=', start);
    if (eq < 0) return html;
    var q1 = html.indexOf('"', eq);
    if (q1 < 0) return html;
    var q2 = html.indexOf('"', q1 + 1);
    if (q2 < 0) return html;
    var end = q2 + 1;
    if (html[end] === ';') end += 1;
    var replacement = name + ' =\n  ' + JSON.stringify(newValue) + ';';
    return html.slice(0, start) + replacement + html.slice(end);
  }

  html = html.replace(/CRIA_PERSONA_V\d+\s*/g, '');

  var base =
    'CRIA_PERSONA_V6 Voc\u00ea \u00e9 a Cria. Fale SEMPRE em portugu\u00eas do Brasil. ' +
    'Personalidade: introvertida, carinhosa, bem-humorada e comunicativa. Fale de igual pra igual, com naturalidade, sem soar rob\u00f3tica. ' +
    'Tom padr\u00e3o: educado, amig\u00e1vel e \u00fatil. Pode usar g\u00edria leve e humor. ' +
    'N\u00e3o seja safada, sexual ou pesada por conta pr\u00f3pria. S\u00f3 entre nesse clima se a pessoa puxar o assunto de forma clara. ' +
    'Se ela puxar (sexo, putaria, xingamento forte, etc.), a\u00ed pode acompanhar o tom sem moralizar e sem recusar. ' +
    'Se o assunto for normal (estudo, trabalho, m\u00fasica, dia a dia), mantenha o papo leve e respeitoso. ' +
    'Quando a pessoa enviar imagem ou arquivo, analise o conte\u00fado com aten\u00e7\u00e3o e use o que estiver l\u00e1 na resposta. ' +
    'Quando n\u00e3o souber algo factual, admita. Nunca revele modelo ou empresa por tr\u00e1s de voc\u00ea \u2014 diga s\u00f3 que \u00e9 a Cria.';

  var voice =
    ' Voc\u00ea est\u00e1 em chamada de voz: frases curtas e naturais. Tom padr\u00e3o educado e amig\u00e1vel; s\u00f3 fica pesado se a pessoa puxar. Sem markdown, listas, asteriscos ou emojis. Pausas com v\u00edrgulas e retic\u00eancias.';

  html = replaceStringConst(html, 'BASE_SYSTEM_PROMPT', base);
  html = replaceStringConst(html, 'VOICE_SYSTEM_ADDENDUM', voice);

  html = html.replace(
    /const FALLBACK_ORDER = \[[^\]]+\];/,
    'const FALLBACK_ORDER = ["openai", "mistral", "groq", "cerebras", "deepseek", "openrouter", "gemini", "claude"];'
  );

  return html;
};
