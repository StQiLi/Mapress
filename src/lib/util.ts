export const nowIso = () => new Date().toISOString();

export const hostname = (u: string) => { 
  try { 
    return new URL(u).hostname.replace(/^www\./, ""); 
  } catch { 
    return u; 
  } 
};

export function unique<T>(arr: T[], key: (t: T) => string) {
  const seen = new Set<string>(); 
  const out: T[] = [];
  for (const x of arr) { 
    const k = key(x); 
    if (!seen.has(k)) { 
      seen.add(k); 
      out.push(x); 
    } 
  }
  return out;
}
