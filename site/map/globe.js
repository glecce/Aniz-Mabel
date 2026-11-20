import { geoContains, geoDistance, geoGraticule10, geoOrthographic, geoPath } from './geo-bundle.mjs';
import { loadArchive } from './archive.js?v=20261120-11';
import { countries, countryAddress, getCountry, loadPhotos } from './countries.js?v=20261120-11';

const canvas = document.querySelector('.world-globe');
const context = canvas.getContext('2d');
const status = document.querySelector('.globe-status');
const initialRotation = [-8, -34];
const projection = geoOrthographic().clipAngle(90).precision(.45);
const path = geoPath(projection, context);
const graticule = geoGraticule10();
const countriesWithWork = new Set();
let shapes = [];
let dots = [];
let rotation = [...initialRotation];
let frame = 0;
let diameter = 0;
let hover;
let gesture;

function renderPath(geometry, fill, stroke, lineWidth = 1) {
  context.beginPath();
  path(geometry);
  if (fill) {
    context.fillStyle = fill;
    context.fill();
  }
  if (stroke) {
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.stroke();
  }
}

function draw() {
  frame = 0;
  const size = canvas.clientWidth;
  if (!size) return;
  const pixels = Math.round(size * Math.min(devicePixelRatio || 1, 2));
  if (canvas.width !== pixels || canvas.height !== pixels) {
    canvas.width = pixels;
    canvas.height = pixels;
  }
  context.setTransform(pixels / size, 0, 0, pixels / size, 0, 0);
  context.clearRect(0, 0, size, size);
  const mid = size / 2;
  const radius = mid - 12;
  diameter = radius * 2;
  projection.rotate(rotation).scale(radius).translate([mid, mid]);

  const ocean = context.createRadialGradient(mid - radius * .3, mid - radius * .4, 0, mid, mid, radius);
  ocean.addColorStop(0, '#ebf4fb');
  ocean.addColorStop(.75, '#c9e3f3');
  ocean.addColorStop(1, '#9fc7e0');
  renderPath({type: 'Sphere'}, ocean, '#7897ad');
  renderPath(graticule, null, '#7897ad55', .55);
  for (const {country, geometry} of shapes) {
    const fill = country === hover ? '#78aed1' : countriesWithWork.has(country) ? '#a6cee6' : '#f6f2e7';
    renderPath(geometry, fill, '#8496a0', .55);
  }

  const center = rotation.map(angle => -angle);
  dots = countries.filter(country => country.dot && geoDistance(center, country.point) < Math.PI / 2)
    .map(country => ({country, xy: projection(country.point)}));
  for (const {country, xy} of dots) {
    context.beginPath();
    context.arc(...xy, country === hover || countriesWithWork.has(country) ? 5 : 2.2, 0, 2 * Math.PI);
    context.fillStyle = country === hover ? '#172f41' : '#215a7b';
    context.fill();
    context.strokeStyle = '#f7f4ed';
    context.lineWidth = 1;
    context.stroke();
  }
  if (canvas.matches(':focus-visible')) {
    showCountry(countryAt(mid, mid));
    context.beginPath();
    context.arc(mid, mid, 5, 0, 2 * Math.PI);
    context.strokeStyle = '#215a7b';
    context.stroke();
  }
}

function requestDraw() {
  if (!frame) frame = requestAnimationFrame(draw);
}

function rotate(x, y) {
  rotation = [
    (rotation[0] + x) % 360,
    Math.max(-89, Math.min(89, rotation[1] + y)),
  ];
  showCountry(undefined);
  requestDraw();
}

function countryAt(x, y) {
  const center = canvas.clientWidth / 2;
  if (Math.hypot(x - center, y - center) > diameter / 2) return undefined;
  let nearest;
  let distance = 14;
  for (const dot of dots) {
    const delta = Math.hypot(x - dot.xy[0], y - dot.xy[1]);
    if (delta >= distance) continue;
    distance = delta;
    nearest = dot.country;
  }
  if (nearest) return nearest;
  const position = projection.invert([x, y]);
  return shapes.find(shape => geoContains(shape.geometry, position))?.country;
}

function showCountry(country) {
  if (country === hover) return;
  hover = country;
  canvas.toggleAttribute('data-hover', Boolean(country));
  canvas.title = country?.name ?? '';
  status.textContent = canvas.title;
  requestDraw();
}

function startGlobe() {
  new ResizeObserver(requestDraw).observe(canvas);
  requestDraw();
  status.textContent = '';
  canvas.addEventListener('focus', requestDraw);
  canvas.addEventListener('blur', requestDraw);
  const step = {ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1]};
  canvas.addEventListener('keydown', event => {
    if (Object.hasOwn(step, event.key)) {
      event.preventDefault();
      rotate(...step[event.key].map(direction => direction * (event.shiftKey ? 1 : 12)));
    } else if (event.key === 'Home') {
      event.preventDefault();
      rotation = [...initialRotation];
      requestDraw();
    } else if (event.key === 'Enter') {
      const center = canvas.clientWidth / 2;
      const country = countryAt(center, center);
      if (country) location.assign(countryAddress(country));
    }
  });
  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    canvas.setPointerCapture(event.pointerId);
    gesture = {id: event.pointerId, startX: event.offsetX, startY: event.offsetY, x: event.offsetX, y: event.offsetY, moved: false};
  });
  canvas.addEventListener('pointermove', event => {
    const {offsetX: x, offsetY: y} = event;
    if (!gesture) {
      if (event.pointerType === 'mouse') showCountry(countryAt(x, y));
      return;
    }
    if (event.pointerId !== gesture.id) return;
    if (!gesture.moved && Math.hypot(x - gesture.startX, y - gesture.startY) < 5) return;
    gesture.moved = true;
    canvas.setAttribute('data-dragging', '');
    const degrees = 135 / diameter;
    rotate((x - gesture.x) * degrees, (gesture.y - y) * degrees);
    gesture.x = x;
    gesture.y = y;
  });
  canvas.addEventListener('pointerup', event => {
    if (event.pointerId !== gesture?.id) return;
    const clicked = !gesture.moved;
    gesture = undefined;
    canvas.removeAttribute('data-dragging');
    if (!clicked) return;
    const country = countryAt(event.offsetX, event.offsetY);
    if (country) location.assign(countryAddress(country));
  });
  canvas.addEventListener('lostpointercapture', event => {
    if (event.pointerId !== gesture?.id) return;
    gesture = undefined;
    canvas.removeAttribute('data-dragging');
  });
  canvas.addEventListener('pointerleave', () => showCountry(undefined));
}

async function loadGlobe() {
  if (!context) throw new Error('Canvas unavailable.');
  const response = await fetch(new URL('boundaries.json', import.meta.url));
  if (!response.ok) throw new Error('Map unavailable.');
  const borders = await response.json();
  shapes = borders.map(([code, coordinates]) => ({
    country: getCountry(code),
    geometry: {type: 'MultiPolygon', coordinates},
  }));
  startGlobe();
}

async function highlightCountriesWithWork() {
  const [photos, archive] = await Promise.allSettled([loadPhotos(), loadArchive()]);
  const work = [
    ...(photos.status === 'fulfilled' ? photos.value : []),
    ...(archive.status === 'fulfilled' ? Object.values(archive.value).flat() : []),
  ];
  for (const entry of work) {
    const country = getCountry(entry.country);
    if (country) countriesWithWork.add(country);
  }
  if (shapes.length) requestDraw();
}

await Promise.all([
  loadGlobe().catch(error => {
    status.textContent = 'Could not load the globe.';
    status.setAttribute('data-error', '');
    canvas.hidden = true;
    console.error(error);
  }),
  highlightCountriesWithWork(),
]);
