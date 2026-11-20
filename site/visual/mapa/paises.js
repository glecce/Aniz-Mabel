import { regions } from './paises-dados.js';

export const countries = regions.map(([code, name, longitude, latitude, dot]) => ({
  code,
  name,
  point: [longitude, latitude],
  dot: Boolean(dot),
}));

const byCode = new Map(countries.map(country => [country.code, country]));
const normalize = name => name.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();
const byName = new Map(countries.map(country => [normalize(country.name), country]));

export function getCountry(value) {
  if (typeof value !== 'string') return undefined;
  return byCode.get(value.trim().toUpperCase()) ?? byName.get(normalize(value));
}

export function countryAddress(country) {
  return '/visual/mapa/pais/?pais=' + country.code;
}

export function countryFlag(country) {
  const flag = document.createElement('span');
  flag.className = 'flag-icon';
  flag.setAttribute('aria-hidden', 'true');
  flag.textContent = String.fromCodePoint(...Array.from(country.code, letter => 0x1f1e6 + letter.charCodeAt(0) - 65));
  return flag;
}

export function countryLabel(country) {
  const label = document.createElement('span');
  label.className = 'country-label';
  label.append(countryFlag(country), country.name);
  return label;
}

export async function loadPhotos() {
  const response = await fetch('/visual/fotos.json');
  if (!response.ok) throw new Error('Catálogo indisponível.');
  return response.json();
}
