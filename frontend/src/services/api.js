// Frontend API Service for Meridian Cold Call Screen
// Connects to Render Backend / Localhost with intelligent offline resilience

const DEFAULT_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export function getBackendUrl() {
  return localStorage.getItem('meridian_backend_url') || DEFAULT_BACKEND_URL;
}

export function setBackendUrl(url) {
  if (url) {
    localStorage.setItem('meridian_backend_url', url.replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('meridian_backend_url');
  }
}

export function getCustomApiKey() {
  return localStorage.getItem('meridian_llm_api_key') || '';
}

export function setCustomApiKey(key) {
  if (key) {
    localStorage.setItem('meridian_llm_api_key', key.trim());
  } else {
    localStorage.removeItem('meridian_llm_api_key');
  }
}

export function getLlmProvider() {
  return localStorage.getItem('meridian_llm_provider') || 'auto'; // 'gemini' | 'groq' | 'auto'
}

export function setLlmProvider(provider) {
  localStorage.setItem('meridian_llm_provider', provider);
}

// Headers helper
function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const customKey = getCustomApiKey();
  const provider = getLlmProvider();
  if (customKey) {
    if (provider === 'gemini') {
      headers['x-gemini-key'] = customKey;
    } else if (provider === 'groq') {
      headers['x-groq-key'] = customKey;
    } else {
      // If auto, send both
      headers['x-gemini-key'] = customKey;
      headers['x-groq-key'] = customKey;
    }
  }
  return headers;
}

// 1. Health check
export async function checkBackendHealth() {
  const base = getBackendUrl();
  const url = base ? `${base}/health` : '/health';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
  return await res.json();
}

// 2. Fetch stages reference
export async function fetchStages() {
  const base = getBackendUrl();
  const url = base ? `${base}/api/stages` : '/api/stages';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch stages: ${res.statusText}`);
  return await res.json();
}

// 3. Start Call
export async function startCall(callPayload) {
  const base = getBackendUrl();
  const url = base ? `${base}/api/calls` : '/api/calls';
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(callPayload)
  });
  if (!res.ok) throw new Error(`Failed to start call: ${res.statusText}`);
  return await res.json();
}

// 4. Save Stage Result
export async function saveStageResult(callId, stageData) {
  const base = getBackendUrl();
  const url = base ? `${base}/api/calls/${callId}/stage` : `/api/calls/${callId}/stage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(stageData)
  });
  if (!res.ok) throw new Error(`Failed to save stage result: ${res.statusText}`);
  return await res.json();
}

// 5. Close Call
export async function closeCall(callId, closeData) {
  const base = getBackendUrl();
  const url = base ? `${base}/api/calls/${callId}/close` : `/api/calls/${callId}/close`;
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(closeData)
  });
  if (!res.ok) throw new Error(`Failed to close call: ${res.statusText}`);
  return await res.json();
}

// 6. List Calls
export async function listCalls(params = {}) {
  const base = getBackendUrl();
  const query = new URLSearchParams(params).toString();
  const url = base ? `${base}/api/calls?${query}` : `/api/calls?${query}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to list calls: ${res.statusText}`);
  return await res.json();
}

// 7. Get Call Detail
export async function getCallDetail(callId) {
  const base = getBackendUrl();
  const url = base ? `${base}/api/calls/${callId}` : `/api/calls/${callId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to get call: ${res.statusText}`);
  return await res.json();
}

// 8. Request Live AI Coaching Pivot
export async function requestAiCoach(data) {
  const base = getBackendUrl();
  const url = base ? `${base}/api/llm/coach` : '/api/llm/coach';
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      ...data,
      provider: getLlmProvider() !== 'auto' ? getLlmProvider() : undefined,
      apiKey: getCustomApiKey() || undefined
    })
  });
  if (!res.ok) throw new Error(`AI Coach error: ${res.statusText}`);
  return await res.json();
}

// 9. Request AI Summary
export async function requestAiSummary(data) {
  const base = getBackendUrl();
  const url = base ? `${base}/api/llm/summarize` : '/api/llm/summarize';
  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      ...data,
      provider: getLlmProvider() !== 'auto' ? getLlmProvider() : undefined,
      apiKey: getCustomApiKey() || undefined
    })
  });
  if (!res.ok) throw new Error(`AI Summary error: ${res.statusText}`);
  return await res.json();
}
