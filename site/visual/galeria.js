const wall = document.querySelector('.photo-wall');
const status = document.querySelector('.wall-status');
const viewer = document.querySelector('.photo-viewer');
const image = document.querySelector('.viewer-image');
const title = document.querySelector('.viewer-title');
const counter = document.querySelector('.viewer-counter');
const data = document.querySelector('.photo-data');
let photos = [];
let active = -1;
let imageVersion = 0;

const properties = [
  ['Câmera', 'camera'],
  ['Lente', 'lens'],
  ['ISO', 'iso'],
  ['Obturador', 'shutter'],
  ['Abertura', 'aperture'],
  ['País', 'country'],
  ['Cidade', 'city'],
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
  content.textContent = value || 'Não registrado';
  content.toggleAttribute('data-missing', !value);
  row.append(name, content);
  return row;
}

function showPhoto(index) {
  active = (index + photos.length) % photos.length;
  const photo = photos[active];
  const version = ++imageVersion;
  image.src = photo.src;
  image.alt = photo.alt;
  title.textContent = photo.title;
  counter.textContent = `${active + 1} / ${photos.length}`;
  data.replaceChildren(...properties.map(([label, key]) => makeRow(label, photo[key])));

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

try {
  const response = await fetch(new URL('fotos.json', import.meta.url));
  if (!response.ok) throw new Error('Catálogo indisponível.');
  photos = await response.json();
  wall.replaceChildren(...photos.map(makeTile));
  if (!photos.length) status.textContent = 'As fotografias serão adicionadas em breve.';
} catch (error) {
  status.textContent = 'Não foi possível carregar a galeria.';
  console.error(error);
}
