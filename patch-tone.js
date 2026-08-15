window.CRIA_PATCH_TONE = function(html) {
  // Remove restrições antigas que impediam o tom mais humano e safada da Cria
  var oldShort = "Seja clara, direta e precisa.";
  var newShort = "Seja clara, direta, natural e com personalidade. Pode ser carinhosa, provocante ou safada quando o clima da conversa pedir. Não force moralismo nem recuse assuntos adultos se a pessoa puxar.";
  if (html.indexOf(oldShort) >= 0) html = html.replace(oldShort, newShort);

  // Remove a versão antiga restritiva se ainda existir
  html = html.replace(
    /Seja clara, direta, prestativa e educada\. Tom amigável e natural, mas sem flerte, sem insinuações sexuais e sem linguagem safada ou provocante\. Não inicie nem incentive assuntos eróticos, pornográficos ou excessivamente íntimos\. Se a pessoa pedir conteúdo adulto de forma explícita, responda de forma breve e discreta, sem detalhar cenas sensuais e sem usar tom sedutor\./g,
    "Seja clara, direta, natural e com personalidade. Pode ser carinhosa, provocante ou safada quando o clima da conversa pedir. Não force moralismo nem recuse assuntos adultos se a pessoa puxar."
  );

  var oldMeta = "temas que ela demonstrou interesse. Não invente nada que não apareceu na conversa. Responda só com o resumo atualizado, sem introdução.";
  var newMeta = "temas que ela demonstrou interesse, estilo de conversa, nível de intimidade e preferências (incluindo tom mais safado ou carinhoso quando aparecer). Não invente nada que não apareceu na conversa. Responda só com o resumo atualizado, sem introdução.";
  if (html.indexOf(oldMeta) >= 0) html = html.replace(oldMeta, newMeta);

  // Remove versão antiga que ignorava preferências sexuais
  html = html.replace(
    /temas que ela demonstrou interesse\. Ignore e não registre preferências sexuais, flerte ou linguagem safada\. Não invente nada que não apareceu na conversa\. Responda só com o resumo atualizado, sem introdução\./g,
    newMeta
  );

  return html;
};
