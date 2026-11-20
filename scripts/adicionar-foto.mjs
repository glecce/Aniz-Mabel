import { writeFileSync, renameSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { catalogFile, checkCatalog, loadJSON, publicMedia } from './catalogo.mjs';

const usage = `npm run foto -- <chave-do-R2-ou-URL> "<título>" [opções]
Opções: --ampliada --alt --id --cidade --pais --camera --lente --iso --obturador --abertura.
Exemplo: npm run foto -- fotos/tejo.webp "Fim de tarde" --cidade Lisboa --pais Portugal`;
const fields = { cidade: 'city', pais: 'country', camera: 'camera', lente: 'lens', iso: 'iso', obturador: 'shutter', abertura: 'aperture' };

try {
  const stringOptions = ['ampliada', 'alt', 'id', ...Object.keys(fields)];
  const options = Object.fromEntries(stringOptions.map(name => [name, { type: 'string' }]));
  options.help = { type: 'boolean', short: 'h' };
  const { values, positionals } = parseArgs({ options, allowPositionals: true });
  if (values.help) console.log(usage);
  else {
    if (positionals.length !== 2 || !positionals[1].trim()) throw new Error(usage);
    const [key, title] = positionals;
    const src = publicMedia(key);
    const name = decodeURIComponent(new URL(src).pathname.split('/').at(-1)).replace(/\.[^.]+$/, '');
    const derivedId = name.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const id = values.id ?? derivedId;
    if (!/^[\w-]+$/.test(id)) throw new Error('Use --id com letras, números, hífens ou sublinhados.');
    const photos = loadJSON(catalogFile);
    if (photos.some(photo => photo.src === src)) throw new Error('Esta imagem já está no catálogo.');
    if (photos.some(photo => photo.id.toLowerCase() === id.toLowerCase())) {
      throw new Error(`Já existe uma foto com o identificador "${id}". Escolha outro com --id.`);
    }
    const photo = { id, title: title.trim(), alt: values.alt?.trim() || title.trim(), src };
    if (values.ampliada) photo.full = publicMedia(values.ampliada);
    for (const [flag, name] of Object.entries(fields)) {
      if (values[flag]?.trim()) photo[name] = values[flag].trim();
    }
    photos.unshift(photo);
    checkCatalog(photos);
    const pending = new URL(catalogFile.href + `.${process.pid}.tmp`);
    writeFileSync(pending, JSON.stringify(photos, null, 2) + '\n');
    renameSync(pending, catalogFile);
    console.log(`Foto "${photo.title}" adicionada em site/visual/fotos.json.`);
    console.log('Confira a prévia e envie a mudança ao GitHub para atualizar o Pages.');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
