export function safeHttpUrl(u: string) {
  try {
    const url = new URL(u);
    if (!/^https?:$/.test(url.protocol)) return null;
    const ip = url.hostname;
    const priv = /^(10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|192\.168\.|0\.)/;
    if (priv.test(ip)) return null;
    return url.toString();
  } catch { 
    return null; 
  }
}

export function stripDangerous(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--.*?-->/g, "");
}
