window.CRIA_PATCH_FILES = function(html) {
  if (html.indexOf('CRIA_FILES_V1') >= 0) return html;

  var oldCall = 'async function callOpenAICompatible({ url, key, model, extraHeaders, history, systemPrompt }) {\n    const response = await fetch(url, {\n      method: "POST",\n      headers: {\n        "Content-Type": "application/json",\n        Authorization: `Bearer ${key}`,\n        ...(extraHeaders || {}),\n      },\n      body: JSON.stringify({\n        model,\n        messages: [{ role: "system", content: systemPrompt }, ...history.map((m) => ({ role: m.role, content: m.text }))],\n      }),\n    });';
  var newCall = 'async function callOpenAICompatible({ url, key, model, extraHeaders, history, systemPrompt, image }) {\n    /* CRIA_FILES_V1 */\n    const messages = [{ role: "system", content: systemPrompt }];\n    history.forEach((m, i) => {\n      const isLast = i === history.length - 1;\n      if (isLast && image && m.role === "user") {\n        messages.push({\n          role: "user",\n          content: [\n            { type: "text", text: m.text || "Analise esta imagem com atencao e descreva o que voce ve." },\n            { type: "image_url", image_url: { url: "data:" + image.mime + ";base64," + image.data } },\n          ],\n        });\n      } else {\n        messages.push({ role: m.role, content: m.text });\n      }\n    });\n    const response = await fetch(url, {\n      method: "POST",\n      headers: {\n        "Content-Type": "application/json",\n        Authorization: `Bearer ${key}`,\n        ...(extraHeaders || {}),\n      },\n      body: JSON.stringify({ model, messages }),\n    });';

  if (html.indexOf(oldCall) >= 0) {
    html = html.replace(oldCall, newCall);
  }

  html = html.replace(
    /callOpenAICompatible\(\{([^}]*?)systemPrompt,\n(\s*)\}\)/g,
    function(match, mid, sp) {
      if (mid.indexOf('image') >= 0) return match;
      return 'callOpenAICompatible({' + mid + 'systemPrompt,\n' + sp + 'image,\n' + sp + '})';
    }
  );

  html = html.replace(
    'const order = image ? FALLBACK_ORDER.filter((k) => PROVIDERS[k].vision) : FALLBACK_ORDER;',
    'const order = image ? ["openai", "gemini", "claude"].concat(FALLBACK_ORDER.filter(function(k){ return PROVIDERS[k] && PROVIDERS[k].vision && k !== "openai" && k !== "gemini" && k !== "claude"; })) : FALLBACK_ORDER;'
  );

  html = html.replace(
    'const historyForApi = text ? nextMessages : [...messages, { role: "user", text: "Analise esta imagem e descreva o que voce ve." }];',
    'const historyForApi = text ? nextMessages : [...messages, { role: "user", text: "Analise com atencao o que eu enviei (imagem ou arquivo). Descreva o conteudo e responda de forma util." }];'
  );

  html = html.replace(
    'const displayText = text || (image ? "[imagem]" : "");',
    'const displayText = text || (image ? "[imagem anexada]" : "");'
  );

  return html;
};
