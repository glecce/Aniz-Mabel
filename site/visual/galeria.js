import { countryAddress, countryLabel, getCountry, loadPhotos } from '../map/countries.js?v=20261120-11';

const wall = document.querySelector('.photo-wall');
const status = document.querySelector('.wall-status');
const viewer = document.querySelector('.photo-viewer');
const image = document.querySelector('.viewer-image');
const counter = document.querySelector('.viewer-counter');
const contextData = document.querySelector('.photo-data-context');
const cameraData = document.querySelector('.photo-data-camera');
const isCountryGallery = wall.hasAttribute('data-country-gallery');
const englishMonth = new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' });
let photos = [];
let active = -1;
let imageVersion = 0;

const cameraProperties = [
  ['Camera', 'camera'],
  ['Lens', 'lens'],
  ['ISO', 'iso'],
  ['Shutter', 'shutter'],
  ['Aperture', 'aperture'],
];

function makeTile(photo, index) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'wall-photo';
  button.setAttribute('aria-label', `Enlarge: ${photo.alt}`);
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
  content.textContent = value || 'Not recorded';
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

function photoDate(date) {
  if (!date) return null;
  const [year, , day] = date.split('-');
  const time = document.createElement('time');
  time.dateTime = date;
  time.lang = 'en';
  time.textContent = [day, englishMonth.format(new Date(date)), year].join('/');
  return time;
}

function showPhoto(index) {
  active = (index + photos.length) % photos.length;
  const photo = photos[active];
  const version = ++imageVersion;
  image.src = photo.src;
  image.alt = photo.alt;
  counter.textContent = `${active + 1} / ${photos.length}`;
  const context = [photo.city, photoCountry(photo.country), photoDate(photo.date)].filter(Boolean);
  contextData.replaceChildren(...context.map(value => {
    const item = document.createElement('span');
    item.append(value);
    return item;
  }));
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

export function renderGallery(items) {
  photos = items;
  wall.replaceChildren(...photos.map(makeTile));
}

if (!isCountryGallery) {
  try {
    renderGallery(await loadPhotos());
    if (!photos.length) status.textContent = 'Photographs coming soon.';
  } catch (error) {
    status.textContent = 'Could not load the gallery.';
    console.error(error);
  }
}
