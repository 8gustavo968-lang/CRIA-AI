window.CRIA_PATCH_FILES = function(html) {
  if (html.indexOf('CRIA_FILES_V1') >= 0) return html;
  var oldCall = atob("YXN5bmMgZnVuY3Rpb24gY2FsbE9wZW5BSUNvbXBhdGlibGUoeyB1cmwsIGtleSwgbW9kZWwsIGV4dHJhSGVhZGVycywgaGlzdG9yeSwgc3lzdGVtUHJvbXB0IH0pIHsKICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7CiAgICAgIG1ldGhvZDogIlBPU1QiLAogICAgICBoZWFkZXJzOiB7CiAgICAgICAgIkNvbnRlbnQtVHlwZSI6ICJhcHBsaWNhdGlvbi9qc29uIiwKICAgICAgICBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7a2V5fWAsCiAgICAgICAgLi4uKGV4dHJhSGVhZGVycyB8fCB7fSksCiAgICAgIH0sCiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsKICAgICAgICBtb2RlbCwKICAgICAgICBtZXNzYWdlczogW3sgcm9sZTogInN5c3RlbSIsIGNvbnRlbnQ6IHN5c3RlbVByb21wdCB9LCAuLi5oaXN0b3J5Lm1hcCgobSkgPT4gKHsgcm9sZTogbS5yb2xlLCBjb250ZW50OiBtLnRleHQgfSkpXSwKICAgICAgfSksCiAgICB9KTs=");
  var newCall = atob("YXN5bmMgZnVuY3Rpb24gY2FsbE9wZW5BSUNvbXBhdGlibGUoeyB1cmwsIGtleSwgbW9kZWwsIGV4dHJhSGVhZGVycywgaGlzdG9yeSwgc3lzdGVtUHJvbXB0LCBpbWFnZSB9KSB7CiAgICAvKiBDUklBX0ZJTEVTX1YxICovCiAgICBjb25zdCBtZXNzYWdlcyA9IFt7IHJvbGU6ICJzeXN0ZW0iLCBjb250ZW50OiBzeXN0ZW1Qcm9tcHQgfV07CiAgICBoaXN0b3J5LmZvckVhY2goKG0sIGkpID0+IHsKICAgICAgY29uc3QgaXNMYXN0ID0gaSA9PT0gaGlzdG9yeS5sZW5ndGggLSAxOwogICAgICBpZiAoaXNMYXN0ICYmIGltYWdlICYmIG0ucm9sZSA9PT0gInVzZXIiKSB7CiAgICAgICAgbWVzc2FnZXMucHVzaCh7CiAgICAgICAgICByb2xlOiAidXNlciIsCiAgICAgICAgICBjb250ZW50OiBbCiAgICAgICAgICAgIHsgdHlwZTogInRleHQiLCB0ZXh0OiBtLnRleHQgfHwgIkFuYWxpemUgZXN0YSBpbWFnZW0gY29tIGF0ZW5jYW8gZSBkZXNjcmV2YSBvIHF1ZSB2b2NlIHZlLiIgfSwKICAgICAgICAgICAgeyB0eXBlOiAiaW1hZ2VfdXJsIiwgaW1hZ2VfdXJsOiB7IHVybDogImRhdGE6IiArIGltYWdlLm1pbWUgKyAiO2Jhc2U2NCwiICsgaW1hZ2UuZGF0YSB9IH0sCiAgICAgICAgICBdLAogICAgICAgIH0pOwogICAgICB9IGVsc2UgewogICAgICAgIG1lc3NhZ2VzLnB1c2goeyByb2xlOiBtLnJvbGUsIGNvbnRlbnQ6IG0udGV4dCB9KTsKICAgICAgfQogICAgfSk7CiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgewogICAgICBtZXRob2Q6ICJQT1NUIiwKICAgICAgaGVhZGVyczogewogICAgICAgICJDb250ZW50LVR5cGUiOiAiYXBwbGljYXRpb24vanNvbiIsCiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2tleX1gLAogICAgICAgIC4uLihleHRyYUhlYWRlcnMgfHwge30pLAogICAgICB9LAogICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IG1vZGVsLCBtZXNzYWdlcyB9KSwKICAgIH0pOw==");
  if (html.indexOf(oldCall) >= 0) html = html.replace(oldCall, newCall);
  html = html.replace(
    /callOpenAICompatible\(\{([^}]*?)systemPrompt,\n(\s*)\}\)/g,
    function(match, mid, sp) {
      if (mid.indexOf('image') >= 0) return match;
      return 'callOpenAICompatible({' + mid + 'systemPrompt,' + String.fromCharCode(10) + sp + 'image,' + String.fromCharCode(10) + sp + '})';
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
