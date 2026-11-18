window.CRIA_PATCH_CHARACTER = function(html) {
  try {
    if (html.indexOf('CRIA_CHAR_V128') >= 0) return html;

    var helpers =
      "  /* CRIA_CHAR_V128 */\n" +
      "  function criaBuildImageUrl(prompt, nsfw){\n" +
      "    var p = String(prompt || 'young brazilian woman selfie').slice(0, 300);\n" +
      "    if (nsfw) p = 'uncensored explicit NSFW ' + p + ', detailed body, no clothes censorship, photorealistic';\n" +
      "    else p = p + ', photorealistic, natural light';\n" +
      "    var seed = Math.floor(Math.random() * 999999);\n" +
      "    return 'https://image.pollinations.ai/prompt/' + encodeURIComponent(p) +\n" +
      "      '?width=768&height=1024&nologo=true&enhance=true&seed=' + seed;\n" +
      "  }\n" +
      "  function criaExtractFotoTags(text){\n" +
      "    var out = [];\n" +
      "    var re = /\\[\\s*FOTO\\s*[:\\-]\\s*([^\\]]+)\\]/gi;\n" +
      "    var m;\n" +
      "    while ((m = re.exec(String(text || '')))) {\n" +
      "      out.push(m[1].trim());\n" +
      "    }\n" +
      "    return out;\n" +
      "  }\n" +
      "  function criaStripFotoTags(text){\n" +
      "    return String(text || '').replace(/\\[\\s*FOTO\\s*[:\\-]\\s*[^\\]]+\\]/gi, '').replace(/\\s{2,}/g, ' ').trim();\n" +
      "  }\n" +
      "  function criaShouldSelfie(text, reply){\n" +
      "    var t = (String(text||'') + ' ' + String(reply||'')).toLowerCase();\n" +
      "    if (/\\[\\s*FOTO/i.test(reply || '')) return true;\n" +
      "    if (/selfie|sua foto|foto sua|como vc (e|é)|te ver|mostra seu corpo|pelad/i.test(t)) return true;\n" +
      "    return false;\n" +
      "  }\n";

    if (html.indexOf('CRIA_CHAR_V128') < 0 && html.indexOf('async function sendMessage') >= 0) {
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
        '      var _nsfwImg = (typeof criaIsSexyIntent === "function" && criaIsSexyIntent(text));\n' +
        '      if (!_fotoPrompts.length && typeof criaShouldSelfie === "function" && criaShouldSelfie(text, replyText)) {\n' +
        '        _fotoPrompts = [_nsfwImg ? "beautiful 22 year old brazilian woman nude intimate selfie, bedroom, seductive expression" : "beautiful 22 year old brazilian woman cute selfie, warm smile, casual clothes"];\n' +
        '      }\n' +
        '      var _genImgs = [];\n' +
        '      for (var _fi = 0; _fi < Math.min(2, _fotoPrompts.length); _fi++) {\n' +
        '        if (typeof criaBuildImageUrl === "function") _genImgs.push(criaBuildImageUrl(_fotoPrompts[_fi], _nsfwImg));\n' +
        '      }\n' +
        '      /* CRIA_CHAR_FOTO_HOOK */\n' +
        '      var parts = (typeof criaStripFotoTags === "function" ? criaStripFotoTags(replyText) : (replyText || "ops")).split("|||").map(function(p){return p.trim();}).filter(Boolean);\n' +
        '      if (!parts.length) parts = ["…"];'
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
        'async function generateImage() {\n    const prompt = imgPrompt.trim();\n    if (!prompt) return;\n    const geminiKey = getKey("gemini");',
        'async function generateImage() {\n    /* CRIA_CHAR_GEN_TAB */\n    const prompt = imgPrompt.trim();\n    if (!prompt) return;\n    const geminiKey = getKey("gemini");'
      );
      html = html.replace(
        'setImgLoading(true);\n    setImgError("");\n    setImgResult(null);\n    try {\n      const res = await fetch(\n        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${encodeURIComponent(\n          geminiKey\n        )}`,',
        'setImgLoading(true);\n    setImgError("");\n    setImgResult(null);\n    try {\n      if (!geminiKey) {\n        var _u = (typeof criaBuildImageUrl === "function") ? criaBuildImageUrl(prompt, /nu|sexo|explicit|nsfw|pelad|pau|buceta/i.test(prompt)) : ("https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) + "?width=768&height=1024&nologo=true");\n        setImgResult(_u);\n        setImgLoading(false);\n        return;\n      }\n      const res = await fetch(\n        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${encodeURIComponent(\n          geminiKey\n        )}`,'
      );
    }
  } catch (e) {
    console.warn('CRIA_PATCH_CHARACTER error', e);
  }
  return html;
};
