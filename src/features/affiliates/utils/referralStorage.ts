const AFFILIATE_CODE_KEY = 'affiliate_code';
const AFFILIATE_CODE_EXPIRY_KEY = 'affiliate_code_expiry';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 1 dia em millisegundos

export function storeAffiliateCode(code: string) {
  if (!code) return;
  
  const expiryTime = Date.now() + ONE_DAY_MS;
  
  localStorage.setItem(AFFILIATE_CODE_KEY, code);
  localStorage.setItem(AFFILIATE_CODE_EXPIRY_KEY, expiryTime.toString());
}

export function getStoredAffiliateCode(): string | null {
  const code = localStorage.getItem(AFFILIATE_CODE_KEY);
  const expiry = localStorage.getItem(AFFILIATE_CODE_EXPIRY_KEY);
  
  if (!code || !expiry) return null;
  
  // Verifica se expirou
  if (Date.now() > parseInt(expiry)) {
    // Remove dados expirados
    localStorage.removeItem(AFFILIATE_CODE_KEY);
    localStorage.removeItem(AFFILIATE_CODE_EXPIRY_KEY);
    return null;
  }
  
  return code;
}

export function clearAffiliateCode() {
  localStorage.removeItem(AFFILIATE_CODE_KEY);
  localStorage.removeItem(AFFILIATE_CODE_EXPIRY_KEY);
}

export function captureAffiliateCodeFromUrl(searchParams: URLSearchParams) {
  const ref = searchParams.get('ref');

  if (ref && /^[a-z0-9]{7}$/i.test(ref)) {
    storeAffiliateCode(ref.toLowerCase());
  }
}

/**
 * Adiciona o código de referência à URL se existir no storage
 */
export function appendReferralCodeToUrl(url: string): string {
  const code = getStoredAffiliateCode();
  
  if (!code) return url;
  
  const urlObj = new URL(url, window.location.origin);
  
  // Não adiciona se já existe um ref na URL
  if (urlObj.searchParams.has('ref')) return url;
  
  urlObj.searchParams.set('ref', code);
  
  return urlObj.pathname + urlObj.search;
}
