const AFFILIATE_CODE_KEY = 'affiliate_code';

export function storeAffiliateCode(code: string) {
  if (!code) return;
  localStorage.setItem(AFFILIATE_CODE_KEY, code);
}

export function getStoredAffiliateCode(): string | null {
  return localStorage.getItem(AFFILIATE_CODE_KEY);
}

export function captureAffiliateCodeFromUrl(searchParams: URLSearchParams) {
  const ref = searchParams.get('ref');

  if (ref && /^[a-z0-9]{7}$/i.test(ref)) {
    storeAffiliateCode(ref.toLowerCase());
  }
}
