import { renderGallery } from '../visual/galeria.js?v=20261120-11';
import { loadArchive } from './archive.js?v=20261120-11';
import { countries, countryAddress, countryFlag, getCountry, getTheme, loadPhotos, themes } from './countries.js?v=20261120-11';

const params = new URLSearchParams(location.search);
const country = getCountry(params.get('country'));
const theme = getTheme(params.get('theme'));
const title = document.querySelector('.country-title');
const content = document.querySelector('.country-content');
const status = document.querySelector('.country-status');
const photoSection = document.querySelector('.country-photos');
const filters = document.querySelector('.country-filters');
const countryPicker = document.querySelector('#country-picker');
const themeField = filters.querySelector('[name=theme]');
const themeNav = document.querySelector('.country-themes');

function renderFilters() {
  const sorted = [...countries].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  countryPicker.add(new Option('Choose a country', ''));
  for (const { name, code } of sorted) countryPicker.add(new Option(name, code));
  countryPicker.value = country?.code ?? '';
  themeField.value = theme;
  themeField.disabled = theme === 'all';
  filters.hidden = false;

  if (!country) return;
  for (const link of themeNav.querySelectorAll('a[data-theme]')) {
    link.href = countryAddress(country, link.dataset.theme);
    if (link.dataset.theme === theme) link.setAttribute('aria-current', 'page');
  }
  themeNav.hidden = false;
}

function renderSection(key, entries) {
  const section = document.createElement('section');
  const list = document.createElement('ul');
  section.setAttribute('aria-label', key);
  if (theme === 'all') {
    const label = document.createElement('h2');
    label.textContent = key;
    section.append(label);
  }
  for (const { href, title } of entries) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = title;
    item.append(link);
    list.append(item);
  }
  section.append(list);
  content.append(section);
}

async function renderArchive() {
  const includeVisual = theme === 'all' || theme === 'visual';
  const [photosResult, archiveResult] = await Promise.allSettled([
    includeVisual ? loadPhotos() : [],
    loadArchive(includeVisual),
  ]);
  const isFromCountry = entry => getCountry(entry.country) === country;
  if (photosResult.status === 'fulfilled') {
    const photos = photosResult.value.filter(isFromCountry);
    if (photos.length) {
      renderGallery(photos);
      photoSection.hidden = false;
    }
  }
  if (archiveResult.status === 'fulfilled') {
    const selected = theme === 'all' ? themes.slice(1) : [theme];
    for (const key of selected) {
      const entries = archiveResult.value[key].filter(isFromCountry);
      if (entries.length) renderSection(key, entries);
    }
  }

  if ([photosResult, archiveResult].some(result => result.status === 'rejected')) {
    status.textContent = 'Some work could not be loaded.';
  } else if (photoSection.hidden && !content.childElementCount) {
    const work = theme === 'visual' ? 'visual work' : theme;
    status.textContent = theme === 'all'
      ? 'No work has been published for this country yet.'
      : `No ${work} has been published for this country yet.`;
  }
}

renderFilters();
if (country) {
  title.replaceChildren(countryFlag(country), country.name);
  document.title = country.name + ' — Aniz Mabel';
  await renderArchive();
} else {
  title.textContent = 'choose a country';
}
