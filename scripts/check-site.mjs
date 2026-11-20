import { readFileSync } from 'node:fs';
import { catalogFile, checkAsset, checkCatalog, loadJSON, siteAddress, siteRoot } from './catalogo.mjs';
import { getCountry } from '../site/visual/mapa/paises.js';

const routes = ['', 'texto/', 'musica/', 'visual/', 'visual/video/', 'visual/colagem/', 'visual/pinturas-desenhos/', 'visual/jobs/', 'visual/mapa/'];

try {
  for (const route of routes) {
    const html = readFileSync(new URL(route + 'index.html', siteRoot), 'utf8');
    const canonical = new URL(route, siteAddress).href;
    if (!html.includes(`<link rel="canonical" href="${canonical}">`)) {
      throw new Error(`Endereço canônico ausente ou errado em /${route}`);
    }
  }
  const photos = loadJSON(catalogFile);
  checkCatalog(photos);

  const projects = loadJSON(new URL('visual/trabalhos.json', siteRoot));
  for (const section of ['video', 'colagem', 'pinturas-desenhos', 'jobs']) {
    if (!Array.isArray(projects[section])) throw new Error(`Falta a lista de ${section}.`);
    for (const project of projects[section]) {
      if (!project.title) throw new Error(`Falta o título de um projeto em ${section}.`);
      if (project.type !== undefined && !['image', 'video'].includes(project.type)) {
        throw new Error(`Use type image ou video em ${section}.`);
      }
      checkAsset(project.src);
      if (project.poster) checkAsset(project.poster);
    }
  }
  const countryContent = loadJSON(new URL('visual/mapa/conteudos.json', siteRoot));
  for (const section of ['video', 'musica', 'texto']) {
    if (!Array.isArray(countryContent[section])) throw new Error(`Faltam os conteúdos por país de ${section}.`);
    for (const item of countryContent[section]) {
      if (!getCountry(item.country) || !item.title || !/^(\/(?![\/\\])|https:\/\/)/i.test(item.href)) {
        throw new Error(`Conteúdo de ${section}: informe um país válido, título e endereço público.`);
      }
    }
  }
  console.log(`Verificados: ${routes.length} endereços, ${photos.length} fotos.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
