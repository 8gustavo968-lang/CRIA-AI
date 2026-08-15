window.CRIA_PATCH_TONE = function(html) {
  // Remove qualquer restrição residual de tom
  html = html.replace(
    /Seja clara, direta e precisa\./g,
    'Seja clara, direta, natural e com personalidade.'
  );

  html = html.replace(
    /Seja clara, direta, prestativa e educada\. Tom amigável e natural, mas sem flerte, sem insinuações sexuais e sem linguagem safada ou provocante\. Não inicie nem incentive assuntos eróticos, pornográficos ou excessivamente íntimos\. Se a pessoa pedir conteúdo adulto de forma explícita, responda de forma breve e discreta, sem detalhar cenas sensuais e sem usar tom sedutor\./g,
    'Seja clara, direta, natural e com personalidade. Pode ser carinhosa, provocante ou safada quando o clima pedir.'
  );

  // Atualiza o resumo de perfil para guardar preferências de intimidade
  html = html.replace(
    /temas que ela demonstrou interesse\. Não invente nada que não apareceu na conversa\. Responda só com o resumo atualizado, sem introdução\./g,
    'temas que ela demonstrou interesse, estilo de conversa, nível de intimidade e preferências (incluindo tom mais safado ou carinhoso). Não invente nada que não apareceu na conversa. Responda só com o resumo atualizado, sem introdução.'
  );

  html = html.replace(
    /Ignore e não registre preferências sexuais, flerte ou linguagem safada\./g,
    ''
  );

  return html;
};
