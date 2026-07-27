/// <reference types="vite/client" />

// Unified API Gateway Client helper for Nyaya-Lipi

export const getApiUrl = (path: string): string => {
  const customUrl = (import.meta as any).env?.VITE_API_URL;
  if (customUrl) {
    const cleanBase = customUrl.replace(/\/$/, '');
    return `${cleanBase}${path}`;
  }
  // Default fallback for local development
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return `http://localhost:5000${path}`;
  }
  // Standard relative API path for production proxies
  return path;
};

export const apiFetch = async (path: string, options: RequestInit = {}): Promise<any> => {
  const url = getApiUrl(path);
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error(`Backend server offline or waking up (Status ${res.status}). Please check your Render backend deployment URL.`);
  }

  if (!res.ok || data.success === false) {
    throw new Error(data.message || `API Request failed with status ${res.status}`);
  }

  return data;
};
