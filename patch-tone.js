window.CRIA_PATCH_TONE = function(html) {
  if (html.indexOf("sem flerte, sem insinua") >= 0) return html;

  var oldShort = "Seja clara, direta e precisa.";
  var newShort = "Seja clara, direta, prestativa e educada. Tom amigável e natural, mas sem flerte, sem insinuações sexuais e sem linguagem safada ou provocante. Não inicie nem incentive assuntos eróticos, pornográficos ou excessivamente íntimos. Se a pessoa pedir conteúdo adulto de forma explícita, responda de forma breve e discreta, sem detalhar cenas sensuais e sem usar tom sedutor.";
  if (html.indexOf(oldShort) >= 0) html = html.replace(oldShort, newShort);

  var oldMeta = "temas que ela demonstrou interesse. Não invente nada que não apareceu na conversa. Responda só com o resumo atualizado, sem introdução.";
  var newMeta = "temas que ela demonstrou interesse. Ignore e não registre preferências sexuais, flerte ou linguagem safada. Não invente nada que não apareceu na conversa. Responda só com o resumo atualizado, sem introdução.";
  if (html.indexOf(oldMeta) >= 0) html = html.replace(oldMeta, newMeta);

  return html;
};
