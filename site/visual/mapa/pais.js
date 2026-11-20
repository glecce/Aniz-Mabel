import { countryFlag, getCountry } from './paises.js?v=20261120-5';

const title = document.querySelector('.country-title');
const content = document.querySelector('.country-content');
const status = document.querySelector('.country-status');
const country = getCountry(new URLSearchParams(location.search).get('country'));
const sections = [
  ['video', 'Video'],
  ['musica', 'Music'],
  ['texto', 'Writing'],
];

if (!country) {
  title.textContent = 'Country not found';
  status.textContent = 'Return to the map to choose a country.';
} else {
  title.replaceChildren(countryFlag(country), country.name);
  document.title = country.name + ' — Aniz Mabel';

  try {
    const response = await fetch(new URL('conteudos.json', import.meta.url));
    if (!response.ok) throw new Error('Country archive unavailable.');
    const catalog = await response.json();
    for (const [key, heading] of sections) {
      const items = catalog[key].filter(item => getCountry(item.country) === country);
      if (!items.length) continue;
      const section = document.createElement('section');
      const label = document.createElement('h2');
      label.textContent = heading;
      const list = document.createElement('ul');
      for (const item of items) {
        const entry = document.createElement('li');
        const link = document.createElement('a');
        link.href = item.href;
        link.textContent = item.title;
        entry.append(link);
        list.append(entry);
      }
      section.append(label, list);
      content.append(section);
    }
  } catch (error) {
    status.textContent = 'Could not load the other work.';
    console.error(error);
  }
}
