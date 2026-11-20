import { regions } from './country-data.js?v=20261120-11';

export const themes = ['all', 'visual', 'writing', 'music'];

const englishNames = new Intl.DisplayNames('en', { type: 'region', fallback: 'none' });
export const countries = regions.map(([code, name, longitude, latitude, dot]) => ({
  code,
  name: englishNames.of(code) ?? name,
  point: [longitude, latitude],
  dot: Boolean(dot),
}));

const byCode = new Map(countries.map(country => [country.code, country]));
const normalize = name => name.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();
const byName = new Map(regions.map(([code, name]) => [normalize(name), byCode.get(code)]));
for (const country of countries) byName.set(normalize(country.name), country);

export function getCountry(value) {
  if (typeof value !== 'string') return undefined;
  return byCode.get(value.trim().toUpperCase()) ?? byName.get(normalize(value));
}

export function getTheme(value) {
  return themes.includes(value) ? value : 'all';
}

export function countryAddress(country, theme = 'all') {
  const params = new URLSearchParams({ country: country.code });
  if (getTheme(theme) !== 'all') params.set('theme', theme);
  return '/map/country/?' + params.toString();
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
  if (!response.ok) throw new Error('Photo catalog unavailable.');
  return response.json();
}
