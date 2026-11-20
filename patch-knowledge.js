window.CRIA_PATCH_KNOWLEDGE = function(html) {
  try {
    if (html.indexOf('CRIA_KNOW_V133') >= 0) return html;
    var helpers =
      "  /* CRIA_KNOW_V133 */\n" +
      "  function criaIsTrainQ(t){ t=String(t||'').toLowerCase(); return /(chatgpt|gpt-?3|gpt-?4).{0,50}(trein|train|token|par[a\u00e2]metro|dataset)|quantos?.{0,20}treinad/i.test(t); }\n" +
      "  function criaIsAxQ(t){ t=String(t||'').toLowerCase(); return /\\b(ax\\s*manager|axmanager|axeron|faster\\s*touch|cache\\s*cleaner|performance\\s*enhancer|plugin\\s*ax)\\b/i.test(t); }\n" +
      "  function criaTrainAnswer(){ return [\n" +
      "    'bora, te explico o treino de verdade',\n" +
      "    'GPT-3 oficial: 175B params, ~300B tokens. GPT-4 estimativa: ~1,8T MoE, ~13T tokens (OpenAI n\u00e3o confirma). Fontes: web, parceiros, RLHF. Etapas: pre-treino, SFT, RLHF.',\n" +
      "    'quer comparar com Llama/Claude?'\n" +
      "  ]; }\n" +
      "  function criaAxAnswer(text){ return [\n" +
      "    'pacote AX Manager + plugins',\n" +
      "    'AxManager: https://github.com/fahrez182/AxManager\\nSite: https://axmanager.app\\nReleases: https://github.com/fahrez182/AxManager/releases\\nPlugins: https://www.magiskmodule.com/category/axmanager-plugin\\nCache Cleaner: https://www.magiskmodule.com/cache-cleaner-axmanager/\\nPerformance: https://www.magiskmodule.com/axeron-performance-enhancer/\\nKang: https://github.com/DEMONNICA/Kang\\nAztras: https://www.magiskmodule.com/aztras\\nInstalar: Plugin > Install from Storage > ZIP > Re-ignite.'\n" +
      "  ]; }\n";
    if (html.indexOf('function getKey') >= 0) html = html.replace('function getKey', helpers + 'function getKey');
    else if (html.indexOf('async function sendMessage') >= 0) html = html.replace('async function sendMessage', helpers + 'async function sendMessage');
    if (html.indexOf('CRIA_KNOW_CMD') < 0) {
      var inj =
        '    /* CRIA_KNOW_CMD */\n' +
        '    if (typeof criaIsTrainQ==="function" && criaIsTrainQ(text)) {\n' +
        '      const nextMessages=[...messages,{role:"user",text}]; setMessages(nextMessages); setInput("");\n' +
        '      var _ta=criaTrainAnswer(); (async function(){ var cur=nextMessages.slice(); for(var i=0;i<_ta.length;i++){ cur=cur.concat([{role:"assistant",text:_ta[i]}]); setMessages(cur); if(i<_ta.length-1) await new Promise(function(r){setTimeout(r,300);}); } })(); return;\n' +
        '    }\n' +
        '    if (typeof criaIsAxQ==="function" && criaIsAxQ(text)) {\n' +
        '      const nextMessages=[...messages,{role:"user",text}]; setMessages(nextMessages); setInput("");\n' +
        '      var _ax=criaAxAnswer(text); (async function(){ var cur=nextMessages.slice(); for(var i=0;i<_ax.length;i++){ cur=cur.concat([{role:"assistant",text:_ax[i]}]); setMessages(cur); if(i<_ax.length-1) await new Promise(function(r){setTimeout(r,280);}); } })(); return;\n' +
        '    }\n';
      if (html.indexOf('CRIA_FF_CMD') >= 0) html = html.replace('/* CRIA_FF_CMD */', inj + '    /* CRIA_FF_CMD */');
      else html = html.replace('const text = input.trim();\n    if (!text || loading) return;', 'const text = input.trim();\n    if (!text || loading) return;\n' + inj);
    }
  } catch (e) { console.warn('CRIA_PATCH_KNOWLEDGE error', e); }
  return html;
};
