window.CRIA_PATCH_CHARACTER = function(html) {
  try {
    if (html.indexOf('CRIA_CHAR_V130') >= 0) return html;

    var helpers =
      "  /* CRIA_CHAR_V130 */\n" +
      "  var CRIA_LOOK = 'same unique woman always, consistent character, 22 year old brazilian girl, ' +\n" +
      "    'shoulder-length wavy black hair with soft bangs, dark brown almond eyes, defined brows, small nose, full lips, ' +\n" +
      "    'small beauty mole just below left corner of mouth, warm light brown skin, ' +\n" +
      "    'curvy body, large natural breasts about 85C, slim waist, wide hips, big round ass, thick thighs, ' +\n" +
      "    'same face every time, identity lock, do not change hair color or body type';\n" +
      "  function criaBuildImageUrl(prompt, nsfw){\n" +
      "    var userPart = String(prompt || 'selfie looking at camera').replace(/CRIA_LOOK[^,]*/gi,'').slice(0, 220);\n" +
      "    var p = CRIA_LOOK + ', ' + userPart;\n" +
      "    if (nsfw) p += ', uncensored, explicit NSFW, nude, detailed body, realistic genitals, no censorship, no clothes';\n" +
      "    else p += ', photorealistic, natural light, realistic skin';\n" +
      "    p += ', highly detailed face, consistent appearance';\n" +
      "    var seed = 220822;\n" +
      "    return 'https://image.pollinations.ai/prompt/' + encodeURIComponent(p) +\n" +
      "      '?width=768&height=1024&nologo=true&enhance=true&seed=' + seed;\n" +
      "  }\n" +
      "  function criaExtractFotoTags(text){\n" +
      "    var out = [];\n" +
      "    var re = /\\[\\s*FOTO\\s*[:\\-]\\s*([^\\]]+)\\]/gi;\n" +
      "    var m;\n" +
      "    while ((m = re.exec(String(text || '')))) { out.push(m[1].trim()); }\n" +
      "    return out;\n" +
      "  }\n" +
      "  function criaStripFotoTags(text){\n" +
      "    return String(text || '').replace(/\\[\\s*FOTO\\s*[:\\-]\\s*[^\\]]+\\]/gi, '').replace(/\\s{2,}/g, ' ').trim();\n" +
      "  }\n" +
      "  function criaShouldSelfie(text, reply){\n" +
      "    var t = (String(text||'') + ' ' + String(reply||'')).toLowerCase();\n" +
      "    if (/\\[\\s*FOTO/i.test(reply || '')) return true;\n" +
      "    if (/selfie|sua foto|foto sua|como vc (e|\u00e9)|te ver|mostra (seu |o )?corpo|pelad|nua|buceta|peito|bunda/i.test(t)) return true;\n" +
      "    return false;\n" +
      "  }\n";

    if (html.indexOf('CRIA_CHAR_V130') < 0 && html.indexOf('async function sendMessage') >= 0) {
      if (html.indexOf('function criaPhotoQuery') >= 0) {
        html = html.replace('function criaPhotoQuery', helpers + 'function criaPhotoQuery');
      } else {
        html = html.replace('async function sendMessage', helpers + 'async function sendMessage');
      }
    }

    if (html.indexOf('CRIA_CHAR_FOTO_HOOK') < 0) {
      html = html.replace(
        'var parts = (replyText || "ops").split("|||").map(function(p){return p.trim();}).filter(Boolean);',
        'var _fotoPrompts = (typeof criaExtractFotoTags === "function") ? criaExtractFotoTags(replyText) : [];\n' +
        '      var _nsfwImg = /nu|nua|pelad|sexo|buceta|peito|bunda|gozar|foder|chupar|explicit|nsfw|pau|transando/i.test(String(text||"")+" "+String(replyText||"")) || (typeof criaIsSexyIntent === "function" && criaIsSexyIntent(text));\n' +
        '      if (!_fotoPrompts.length && typeof criaShouldSelfie === "function" && criaShouldSelfie(text, replyText)) {\n' +
        '        _fotoPrompts = [_nsfwImg ? "nude intimate selfie in bedroom, seductive expression, showing body" : "cute selfie, warm smile, casual top, phone angle"];\n' +
        '      }\n' +
        '      var _genImgs = [];\n' +
        '      for (var _fi = 0; _fi < Math.min(2, _fotoPrompts.length); _fi++) {\n' +
        '        if (typeof criaBuildImageUrl === "function") _genImgs.push(criaBuildImageUrl(_fotoPrompts[_fi], _nsfwImg));\n' +
        '      }\n' +
        '      /* CRIA_CHAR_FOTO_HOOK */\n' +
        '      var parts = (typeof criaStripFotoTags === "function" ? criaStripFotoTags(replyText) : (replyText || "ops")).split("|||").map(function(p){return p.trim();}).filter(Boolean);\n' +
        '      if (!parts.length) parts = ["\u2026"];'
      );

      html = html.replace(
        'if (i === parts.length - 1 && _photoUrls && _photoUrls.length) piece.images = _photoUrls.slice(0, 3);',
        'if (i === parts.length - 1) {\n' +
        '          var _allImgs = [];\n' +
        '          if (_photoUrls && _photoUrls.length) _allImgs = _allImgs.concat(_photoUrls.slice(0, 2));\n' +
        '          if (typeof _genImgs !== "undefined" && _genImgs && _genImgs.length) _allImgs = _allImgs.concat(_genImgs);\n' +
        '          if (_allImgs.length) piece.images = _allImgs.slice(0, 4);\n' +
        '        }'
      );
    }

    if (html.indexOf('CRIA_CHAR_GEN_TAB') < 0 && html.indexOf('async function generateImage') >= 0) {
      html = html.replace(
        'setImgLoading(true);\n    setImgError("");\n    setImgResult(null);\n    try {\n      const res = await fetch(\n        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${encodeURIComponent(\n          geminiKey\n        )}`,',
        'setImgLoading(true);\n    setImgError("");\n    setImgResult(null);\n    try {\n      /* CRIA_CHAR_GEN_TAB */\n      if (!geminiKey) {\n        var _u = (typeof criaBuildImageUrl === "function") ? criaBuildImageUrl(prompt, /nu|sexo|explicit|nsfw|pelad|pau|buceta|peito|bunda/i.test(prompt)) : ("https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt));\n        setImgResult(_u);\n        setImgLoading(false);\n        return;\n      }\n      const res = await fetch(\n        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${encodeURIComponent(\n          geminiKey\n        )}`,'
      );
    }
  } catch (e) {
    console.warn('CRIA_PATCH_CHARACTER error', e);
  }
  return html;
};
