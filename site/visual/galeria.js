import { countryAddress, countryLabel, getCountry, loadPhotos } from './mapa/paises.js';

const wall = document.querySelector('.photo-wall');
const status = document.querySelector('.wall-status');
const viewer = document.querySelector('.photo-viewer');
const image = document.querySelector('.viewer-image');
const title = document.querySelector('.viewer-title');
const counter = document.querySelector('.viewer-counter');
const contextData = document.querySelector('.photo-data-context');
const cameraData = document.querySelector('.photo-data-camera');
const isCountryGallery = wall.hasAttribute('data-country-gallery');
let photos = [];
let active = -1;
let imageVersion = 0;

const cameraProperties = [
  ['Câmera', 'camera'],
  ['Lente', 'lens'],
  ['ISO', 'iso'],
  ['Obturador', 'shutter'],
  ['Abertura', 'aperture'],
];

function makeTile(photo, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'wall-photo';
  button.setAttribute('aria-label', `Ampliar: ${photo.alt}`);
  const thumbnail = document.createElement('img');
  thumbnail.src = photo.src;
  thumbnail.alt = '';
  if (photo.width && photo.height) {
    thumbnail.width = photo.width;
    thumbnail.height = photo.height;
  }
  thumbnail.loading = index < 12 ? 'eager' : 'lazy';
  thumbnail.decoding = 'async';
  button.append(thumbnail);
  button.addEventListener('click', () => {
    showPhoto(index);
    viewer.showModal();
  });
  return button;
}

function makeRow(label, value) {
  const row = document.createElement('div');
  const name = document.createElement('dt');
  const content = document.createElement('dd');
  name.textContent = label;
  content.append(value || 'Não registrado');
  content.toggleAttribute('data-missing', !value);
  row.append(name, content);
  return row;
}

function photoCountry(value) {
  const country = getCountry(value);
  if (!country) return value;
  const label = countryLabel(country);
  if (isCountryGallery) return label;
  const link = document.createElement('a');
  link.className = 'photo-country-link';
  link.href = countryAddress(country);
  link.append(label);
  return link;
}

function showPhoto(index) {
  active = (index + photos.length) % photos.length;
  const photo = photos[active];
  const version = ++imageVersion;
  image.src = photo.src;
  image.alt = photo.alt;
  title.textContent = photo.title;
  counter.textContent = `${active + 1} / ${photos.length}`;
  const date = photo.date?.split('-').reverse().join('/');
  contextData.replaceChildren(
    makeRow('Cidade', photo.city),
    makeRow('País', photoCountry(photo.country)),
    makeRow('Data', date),
  );
  cameraData.replaceChildren(...cameraProperties.map(([label, key]) => makeRow(label, photo[key])));

  if (photo.full && photo.full !== photo.src) {
    const full = new Image();
    full.onload = () => { if (version === imageVersion) image.src = photo.full; };
    full.src = photo.full;
  }
}

document.querySelector('.viewer-prev').addEventListener('click', () => showPhoto(active - 1));
document.querySelector('.viewer-next').addEventListener('click', () => showPhoto(active + 1));
viewer.addEventListener('keydown', event => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  showPhoto(active + (event.key === 'ArrowLeft' ? -1 : 1));
});
viewer.addEventListener('close', () => {
  ++imageVersion;
  image.removeAttribute('src');
});

const country = isCountryGallery ? getCountry(new URLSearchParams(location.search).get('pais')) : null;
if (!isCountryGallery || country) {
  if (isCountryGallery) wall.closest('.country-photos').hidden = false;
  try {
    const catalog = await loadPhotos();
    photos = country ? catalog.filter(photo => getCountry(photo.country) === country) : catalog;
    wall.replaceChildren(...photos.map(makeTile));
    if (!photos.length) status.textContent = 'As fotografias serão adicionadas em breve.';
  } catch (error) {
    status.textContent = 'Não foi possível carregar a galeria.';
    console.error(error);
  }
}
