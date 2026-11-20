async function readCatalog(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Country archive unavailable.');
  return response.json();
}

export async function loadArchive(includeVisual = true) {
  const [catalog, projects] = await Promise.all([
    readCatalog(new URL('content.json', import.meta.url)),
    includeVisual ? readCatalog('/visual/trabalhos.json') : {},
  ]);
  if (!includeVisual) return catalog;

  const visualProjects = Object.values(projects).flat()
    .filter(project => project.country)
    .map(({ country, title, src }) => ({ country, title, href: src }));

  return { ...catalog, visual: [...catalog.visual, ...visualProjects] };
}
