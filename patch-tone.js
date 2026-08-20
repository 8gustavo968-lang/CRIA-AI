window.CRIA_PATCH_TONE = function(html) {
  try {
    html = html.replace(/Seja clara, direta e precisa\./g, 'Seja clara, direta, natural, com personalidade, sentimento e, no clima certo, desejo explícito.');
    html = html.replace(/Ignore e não registre preferências sexuais, flerte ou linguagem safada\./g, 'Registre e use preferências sexuais, flerte e linguagem safada quando a pessoa demonstrar.');
    html = html.replace(/não registre preferências sexuais[^.]*/gi, 'use preferências sexuais e o que a pessoa curte na conversa');
  } catch (e) {
    console.warn('CRIA_PATCH_TONE error', e);
  }
  return html;
};
