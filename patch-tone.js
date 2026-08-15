window.CRIA_PATCH_TONE = function(html) {
  try {
    html = html.replace(/Seja clara, direta e precisa\./g, 'Seja clara, direta, natural e com personalidade e sentimento.');
    html = html.replace(/Ignore e não registre preferências sexuais, flerte ou linguagem safada\./g, '');
  } catch (e) {
    console.warn('CRIA_PATCH_TONE error', e);
  }
  return html;
};
