function imageSource(value) {
  if (typeof value !== 'string' || value.length > 2048) return '';
  if (/^\/assets\/(?:[\w.-]+\/)*[\w.-]+$/.test(value) && !value.split('/').some(part => part === '.' || part === '..')) return value;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch {
    return '';
  }
  return '';
}

const page = document.querySelector('[data-section]');
const grid = page.querySelector('.project-grid');
const empty = page.querySelector('.project-empty');

function makeProject(project) {
  const src = imageSource(project.src);
  if (!src || !project.title) return null;
  const item = document.createElement('article');
  const video = (project.type ?? (page.dataset.section === 'video' ? 'video' : 'image')) === 'video';
  const media = document.createElement(video ? 'video' : 'img');
  media.src = src;
  if (video) {
    media.controls = true;
    media.preload = 'none';
    media.playsInline = true;
    const poster = imageSource(project.poster);
    if (poster) media.poster = poster;
    media.setAttribute('aria-label', project.title);
  } else {
    media.alt = project.alt || project.title;
    media.loading = 'lazy';
  }
  const title = document.createElement('h3');
  title.textContent = project.title;
  item.append(media, title);
  if (project.description) {
    const description = document.createElement('p');
    description.textContent = project.description;
    item.append(description);
  }
  return item;
}

try {
  const reply = await fetch(new URL('trabalhos.json', import.meta.url));
  if (!reply.ok) throw new Error('Arquivo indisponível.');
  const collection = await reply.json();
  const items = collection[page.dataset.section].map(makeProject).filter(Boolean);
  grid.replaceChildren(...items);
  empty.hidden = items.length > 0;
} catch {
  empty.textContent = 'Não foi possível carregar os trabalhos.';
}
