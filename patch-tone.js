window.CRIA_PATCH_TONE = function(html) {
  // Remove qualquer restrição de tom que ainda exista no código base
  html = html.replace(
    /Seja clara, direta e precisa\./g,
    'Seja clara, direta, natural e com personalidade e sentimento.'
  );

  html = html.replace(
    /sem flerte, sem insinuações sexuais e sem linguagem safada ou provocante[^\"]*/g,
    'com personalidade. Pode ser carinhosa, provocante ou safada quando o clima pedir'
  );

  html = html.replace(
    /Ignore e não registre preferências sexuais, flerte ou linguagem safada\./g,
    ''
  );

  html = html.replace(
    /temas que ela demonstrou interesse\. Não invente nada que não apareceu na conversa\. Responda só com o resumo atualizado, sem introdução\./g,
    'temas que ela demonstrou interesse, estilo de conversa, nível de intimidade, preferências (incluindo tom safado ou carinhoso) e assuntos técnicos (jogos, configs). Não invente nada. Responda só com o resumo atualizado, sem introdução.'
  );

  return html;
};
