import { readFileSync, statSync } from 'node:fs';

export const siteRoot = new URL('../site/', import.meta.url);
export const catalogFile = new URL('alternativa/fotos.json', siteRoot);
const { config } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
export const siteAddress = new URL(config.site_url);
const mediaAddress = new URL(config.media_url);

export function loadJSON(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function publicMedia(input) {
  if (!input || input.trim() !== input) throw new Error('Informe a chave do arquivo no R2 ou uma URL HTTPS pública.');
  if (/^[a-z][a-z\d+.-]*:/i.test(input)) {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.username || url.password || url.hash || /(?:^|\.)r2\.cloudflarestorage\.com$/i.test(url.hostname)) {
      throw new Error('Use a URL pública da imagem, como media.anizmabel.com, sem credenciais.');
    }
    if ([...url.searchParams.keys()].some(key => /^(x-amz-|token$|sig$|signature$|access_token$)/i.test(key))) {
      throw new Error('Use um endereço público permanente, sem assinatura ou token.');
    }
    return url.href;
  }
  const segments = input.split('/');
  if (segments.some(segment => !segment || segment === '.' || segment === '..' || segment.includes('\\'))) {
    throw new Error('Informe uma chave como fotos/minha-foto.webp.');
  }
  return new URL(segments.map(encodeURIComponent).join('/'), mediaAddress).href;
}

export function checkAsset(path) {
  if (typeof path !== 'string' || !path) throw new Error('O endereço da imagem está vazio.');
  if (path.startsWith('/')) {
    const parts = path.slice(1).split('/');
    if (!path.startsWith('/assets/') || parts.some(part => !/^[\w.-]+$/.test(part) || part === '.' || part === '..')) {
      throw new Error(`Arquivo fora de /assets/: ${path}`);
    }
    try {
      if (statSync(new URL(path.slice(1), siteRoot)).isFile()) return;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    throw new Error(`Arquivo ausente: ${path}`);
  }
  if (!path.startsWith('https://')) throw new Error(`Use um endereço HTTPS público: ${path}`);
  publicMedia(path);
}

export function checkCatalog(photos) {
  if (!Array.isArray(photos) || !photos.length) throw new Error('O catálogo precisa ter pelo menos uma foto.');
  const ids = new Set();
  for (const photo of photos) {
    if (!photo || typeof photo.id !== 'string' || !/^[\w-]+$/.test(photo.id)) throw new Error('Identificador de foto inválido.');
    if (ids.has(photo.id)) throw new Error(`Identificador de foto repetido: ${photo.id}`);
    ids.add(photo.id);
    for (const key of ['alt', 'title']) {
      if (typeof photo[key] !== 'string' || !photo[key].trim()) throw new Error(`${photo.id}: preencha ${key}.`);
    }
    for (const key of ['city', 'country', 'camera', 'lens', 'iso', 'shutter', 'aperture']) {
      if (photo[key] !== undefined && typeof photo[key] !== 'string') throw new Error(`${photo.id}: ${key} precisa ser texto.`);
    }
    if (photo.width !== undefined || photo.height !== undefined) {
      if (![photo.width, photo.height].every(value => Number.isInteger(value) && value > 0)) {
        throw new Error(`${photo.id}: informe largura e altura positivas juntas.`);
      }
    }
    checkAsset(photo.src);
    if (photo.full) checkAsset(photo.full);
  }
}
