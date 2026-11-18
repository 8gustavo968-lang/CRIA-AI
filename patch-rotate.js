window.CRIA_PATCH_ROTATE = function(html) {
  try {
    if (html.indexOf('CRIA_ROTATE_V129') >= 0) return html;

    var helpers =
      "  /* CRIA_ROTATE_V129 */\n" +
      "  function criaLoadPool(){\n" +
      "    try { return JSON.parse(localStorage.getItem('cria_api_pool') || '{}') || {}; } catch(e){ return {}; }\n" +
      "  }\n" +
      "  function criaSavePool(p){\n" +
      "    try { localStorage.setItem('cria_api_pool', JSON.stringify(p)); } catch(e){}\n" +
      "  }\n" +
      "  function criaLoadCooldown(){\n" +
      "    try { return JSON.parse(localStorage.getItem('cria_api_cd') || '{}') || {}; } catch(e){ return {}; }\n" +
      "  }\n" +
      "  function criaSaveCooldown(c){\n" +
      "    try { localStorage.setItem('cria_api_cd', JSON.stringify(c)); } catch(e){}\n" +
      "  }\n" +
      "  function criaMarkCooldown(provider, key, ms){\n" +
      "    var cd = criaLoadCooldown();\n" +
      "    var id = provider + '::' + String(key).slice(0, 12);\n" +
      "    cd[id] = Date.now() + (ms || 15*60*1000);\n" +
      "    criaSaveCooldown(cd);\n" +
      "  }\n" +
      "  function criaIsCool(provider, key){\n" +
      "    var cd = criaLoadCooldown();\n" +
      "    var id = provider + '::' + String(key).slice(0, 12);\n" +
      "    var until = cd[id] || 0;\n" +
      "    if (until && until > Date.now()) return true;\n" +
      "    if (until) { delete cd[id]; criaSaveCooldown(cd); }\n" +
      "    return false;\n" +
      "  }\n" +
      "  function criaSplitKeys(raw){\n" +
      "    return String(raw || '').split(/[\\n,;|]+/).map(function(s){return s.trim();}).filter(Boolean);\n" +
      "  }\n" +
      "  function criaAllKeysFor(name, uiVal, defVal){\n" +
      "    var pool = criaLoadPool();\n" +
      "    var list = [];\n" +
      "    if (pool[name] && pool[name].length) list = list.concat(pool[name]);\n" +
      "    list = list.concat(criaSplitKeys(uiVal));\n" +
      "    list = list.concat(criaSplitKeys(defVal));\n" +
      "    var seen = {};\n" +
      "    return list.filter(function(k){ if (seen[k]) return false; seen[k]=1; return true; });\n" +
      "  }\n" +
      "  function criaPickKey(name, uiVal, defVal){\n" +
      "    var keys = criaAllKeysFor(name, uiVal, defVal);\n" +
      "    if (!keys.length) return '';\n" +
      "    var idxKey = 'cria_key_idx_' + name;\n" +
      "    var idx = 0;\n" +
      "    try { idx = parseInt(localStorage.getItem(idxKey) || '0', 10) || 0; } catch(e){}\n" +
      "    for (var t = 0; t < keys.length; t++) {\n" +
      "      var k = keys[(idx + t) % keys.length];\n" +
      "      if (!criaIsCool(name, k)) {\n" +
      "        try { localStorage.setItem(idxKey, String((idx + t + 1) % keys.length)); } catch(e){}\n" +
      "        return k;\n" +
      "      }\n" +
      "    }\n" +
      "    return keys[idx % keys.length];\n" +
      "  }\n" +
      "  function criaAddKeyToPool(name, key){\n" +
      "    key = String(key || '').trim();\n" +
      "    if (!key) return false;\n" +
      "    var pool = criaLoadPool();\n" +
      "    if (!pool[name]) pool[name] = [];\n" +
      "    if (pool[name].indexOf(key) < 0) pool[name].push(key);\n" +
      "    criaSavePool(pool);\n" +
      "    return true;\n" +
      "  }\n" +
      "  function criaLoadCustomApis(){\n" +
      "    try { return JSON.parse(localStorage.getItem('cria_custom_apis') || '[]') || []; } catch(e){ return []; }\n" +
      "  }\n" +
      "  function criaSaveCustomApis(arr){\n" +
      "    try { localStorage.setItem('cria_custom_apis', JSON.stringify(arr)); } catch(e){}\n" +
      "  }\n" +
      "  function criaAddCustomApi(obj){\n" +
      "    var arr = criaLoadCustomApis();\n" +
      "    var id = obj.id || ('custom_' + Date.now());\n" +
      "    obj.id = id;\n" +
      "    arr = arr.filter(function(a){ return a.id !== id; });\n" +
      "    arr.push(obj);\n" +
      "    criaSaveCustomApis(arr);\n" +
      "    return id;\n" +
      "  }\n" +
      "  function criaParseApiCommand(text){\n" +
      "    var t = String(text || '').trim();\n" +
      "    if (/^api\\s+nova\\b/i.test(t)) {\n" +
      "      var url = (t.match(/url\\s*=\\s*(\\S+)/i) || [])[1];\n" +
      "      var key = (t.match(/key\\s*=\\s*(\\S+)/i) || [])[1];\n" +
      "      var model = (t.match(/model\\s*=\\s*(\\S+)/i) || [])[1] || 'gpt-4o-mini';\n" +
      "      var label = (t.match(/nome\\s*=\\s*(\\S+)/i) || [])[1] || 'Custom';\n" +
      "      if (url && key) return { type: 'custom', url: url, key: key, model: model, label: label };\n" +
      "    }\n" +
      "    var m = t.match(/^chave\\s+(groq|gemini|openrouter|mistral|deepseek|cerebras|aion|cohere)\\s+(\\S+)/i);\n" +
      "    if (m) return { type: 'pool', provider: m[1].toLowerCase(), key: m[2] };\n" +
      "    return null;\n" +
      "  }\n";

    if (html.indexOf('CRIA_ROTATE_V129') < 0) {
      if (html.indexOf('function getKey') >= 0) {
        html = html.replace('function getKey', helpers + 'function getKey');
      } else if (html.indexOf('async function sendMessage') >= 0) {
        html = html.replace('async function sendMessage', helpers + 'async function sendMessage');
      }
    }

    html = html.replace(
      'function getKey(name) {\n    const fromUi = (keys[name] || "").trim();\n    if (fromUi) return fromUi;\n    return (DEFAULT_KEYS[name] || "").trim();\n  }',
      'function getKey(name) {\n    /* CRIA_ROTATE_GETKEY */\n    var fromUi = (keys[name] || "");\n    var defv = (DEFAULT_KEYS[name] || "");\n    if (typeof criaPickKey === "function") {\n      var picked = criaPickKey(name, fromUi, defv);\n      if (picked) return picked;\n    }\n    var t = String(fromUi || "").trim();\n    if (t) return t.split(/[\\n,;|]/)[0].trim();\n    return String(defv || "").trim();\n  }'
    );

    if (html.indexOf('CRIA_ROTATE_OAI') < 0) {
      html = html.replace(
        'async function callOpenAICompatible({ url, key, model, extraHeaders, history, systemPrompt }) {\n    const response = await fetch(url, {\n      method: "POST",\n      headers: {\n        "Content-Type": "application/json",\n        Authorization: `Bearer ${key}`,\n        ...(extraHeaders || {}),\n      },\n      body: JSON.stringify({\n        model,\n        messages: [{ role: "system", content: systemPrompt }, ...history.map((m) => ({ role: m.role, content: m.text }))],\n      }),\n    });\n    const data = await response.json();\n    if (data.error) throw new Error(data.error.message || "erro");\n    return data?.choices?.[0]?.message?.content || "";\n  }',
        'async function callOpenAICompatible({ url, key, model, extraHeaders, history, systemPrompt, providerName }) {\n    /* CRIA_ROTATE_OAI */\n    const response = await fetch(url, {\n      method: "POST",\n      headers: {\n        "Content-Type": "application/json",\n        Authorization: "Bearer " + key,\n        ...(extraHeaders || {}),\n      },\n      body: JSON.stringify({\n        model,\n        messages: [{ role: "system", content: systemPrompt }].concat(history.map(function(m){ return { role: m.role, content: m.text }; })),\n      }),\n    });\n    var raw = await response.text();\n    var data = {};\n    try { data = JSON.parse(raw); } catch(e) { data = { error: { message: raw.slice(0, 120) } }; }\n    if (!response.ok || data.error) {\n      var msg = (data.error && (data.error.message || data.error)) || ("http " + response.status);\n      msg = String(msg);\n      if (response.status === 429 || /rate|quota|limit|insufficient/i.test(msg)) {\n        if (typeof criaMarkCooldown === "function") criaMarkCooldown(providerName || model || "oai", key, 20*60*1000);\n      } else if (response.status === 401 || response.status === 403 || /invalid.*key|unauthorized|incorrect api/i.test(msg)) {\n        if (typeof criaMarkCooldown === "function") criaMarkCooldown(providerName || model || "oai", key, 2*60*60*1000);\n      }\n      throw new Error(msg);\n    }\n    return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";\n  }'
      );
    }

    if (html.indexOf('CRIA_ROTATE_ASK') < 0) {
      html = html.replace(
        'for (const key of order) {\n        const cfg = PROVIDERS[key];\n        if (cfg.needsKey && !getKey(key)) continue;\n        try {\n          const text = await callByProviderKey(key, history, systemPrompt, image);\n          if (text && text.trim()) return text.trim();\n        } catch (e) {\n          lastError = e;\n        }\n      }',
        '/* CRIA_ROTATE_ASK */\n      for (const key of order) {\n        const cfg = PROVIDERS[key];\n        if (!cfg) continue;\n        if (cfg.needsKey && !getKey(key)) continue;\n        var attempts = cfg.needsKey ? 3 : 1;\n        for (var _ai = 0; _ai < attempts; _ai++) {\n          try {\n            const text = await callByProviderKey(key, history, systemPrompt, image);\n            if (text && text.trim()) {\n              var t = text.trim();\n              var low = t.toLowerCase();\n              if (/sou ia|nao tenho corpo|n\u00e3o tenho corpo|assistente de ia|content policy|as an ai|i cannot/i.test(low)) {\n                lastError = new Error("recusa_modelo");\n                continue;\n              }\n              return t;\n            }\n          } catch (e) {\n            lastError = e;\n          }\n        }\n      }\n      try {\n        var customs = (typeof criaLoadCustomApis === "function") ? criaLoadCustomApis() : [];\n        for (var ci = 0; ci < customs.length; ci++) {\n          var ca = customs[ci];\n          if (!ca || !ca.url || !ca.key) continue;\n          if (typeof criaIsCool === "function" && criaIsCool(ca.id || "custom", ca.key)) continue;\n          try {\n            var ct = await callOpenAICompatible({\n              url: ca.url,\n              key: ca.key,\n              model: ca.model || "gpt-4o-mini",\n              history: history,\n              systemPrompt: systemPrompt,\n              providerName: ca.id || "custom"\n            });\n            if (ct && ct.trim()) return ct.trim();\n          } catch (ce) { lastError = ce; }\n        }\n      } catch (_ce) {}'
      );
    }

    if (html.indexOf('CRIA_ROTATE_CMD') < 0) {
      html = html.replace(
        'const nextMessages = [...messages, { role: "user", text }];\n    setMessages(nextMessages);\n    setInput("");\n    setLoading(true);',
        '/* CRIA_ROTATE_CMD */\n    if (typeof criaParseApiCommand === "function") {\n      var _cmd = criaParseApiCommand(text);\n      if (_cmd) {\n        const nextMessages = [...messages, { role: "user", text }];\n        setMessages(nextMessages);\n        setInput("");\n        if (_cmd.type === "pool") {\n          criaAddKeyToPool(_cmd.provider, _cmd.key);\n          setMessages(nextMessages.concat([\n            { role: "assistant", text: "recebi" },\n            { role: "assistant", text: "chave do " + _cmd.provider + " entrou no pool" },\n            { role: "assistant", text: "quando uma bater limite eu troco sozinha kkk" }\n          ]));\n        } else if (_cmd.type === "custom") {\n          criaAddCustomApi({ label: _cmd.label, url: _cmd.url, key: _cmd.key, model: _cmd.model });\n          setMessages(nextMessages.concat([\n            { role: "assistant", text: "api nova salva" },\n            { role: "assistant", text: _cmd.label + " \u00b7 " + _cmd.model },\n            { role: "assistant", text: "vou usar ela no rodizio quando precisar" }\n          ]));\n        }\n        return;\n      }\n    }\n    const nextMessages = [...messages, { role: "user", text }];\n    setMessages(nextMessages);\n    setInput("");\n    setLoading(true);'
      );
    }

    if (html.indexOf('CRIA_ROTATE_HINT') < 0) {
      html = html.replace(
        '<KeyField label="Chave 1" value={keys.groq} onChange={(v) => updateKey("groq", v)} hint="console.groq.com" />',
        '<div style={{fontSize:12,opacity:0.75,marginBottom:8}}>Varias chaves: separe por virgula. Chat: chave groq SUA_KEY \u00b7 api nova url=https://.../v1/chat/completions key=sk-... model=gpt-4o-mini</div>\n' +
        '            <KeyField label="Chave 1 (pool Groq)" value={keys.groq} onChange={(v) => updateKey("groq", v)} hint="console.groq.com — varias chaves ok" />'
      );
    }
  } catch (e) {
    console.warn('CRIA_PATCH_ROTATE error', e);
  }
  return html;
};
