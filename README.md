# Aniz Mabel

O endereço principal é [anizmabel.com](https://anizmabel.com/). A entrada reúne [Texto](https://anizmabel.com/writing/), [Visual](https://anizmabel.com/visual/) e [Música](https://anizmabel.com/music/).

## Onde editar

| Arquivo ou pasta | O que controla |
|---|---|
| `site/index.html` e `site/assets/inicio.css` | Página inicial e estilo de Texto e Música |
| `site/assets/cores.css` | Cores compartilhadas por todo o site |
| `site/writing/index.html` | Publicações escritas |
| `site/music/index.html` | Projetos musicais |
| `site/visual/index.html` | Página das fotos e janela de ampliação |
| `site/visual/estilo.css` | Aparência da galeria e das outras páginas |
| `site/visual/galeria.js` | Carregamento das fotos, dados técnicos e navegação entre imagens |
| `site/visual/fotos.json` | Ordem, títulos, endereços, data, localização, câmera e exposição das fotos |
| `site/visual/trabalhos.json` | Conteúdo de vídeos, colagens, pinturas e desenhos e da página Jobs |
| `site/visual/mapa/conteudos.json` | Vídeos, músicas e textos dos arquivos por país |
| `site/assets/fotos/` | Miniaturas e versões ampliadas que o próprio site serve |
| `site/_redirects` | Encaminha os endereços antigos para `/visual/` no Cloudflare Pages |

## Ver no computador

Abra a pasta **Aniz Mabel** no VS Code e use **Go Live**. O endereço é [127.0.0.1:5500](http://127.0.0.1:5500/). Outra opção é rodar no terminal:

```sh
python3 -m http.server 8787 --bind 127.0.0.1 --directory site
```

Nesse caso, abra a [prévia na porta 8787](http://127.0.0.1:8787/).

## Publicar uma foto

1. Envie a cópia para web ao [bucket do Cloudflare R2](https://dash.cloudflare.com/?to=/:account/r2/overview). Para usar chaves como `fotos/tejo.webp`, o bucket precisa estar vinculado a `media.anizmabel.com`. Uma URL pública HTTPS também funciona.
2. Edite `site/visual/fotos.json` ou use o comando abaixo. `--ampliada` é opcional. Para ver todas as opções de metadados, rode `npm run foto -- --help`.
3. Rode `npm run check` e envie o commit ao GitHub. O Cloudflare Pages publica a pasta `site/` a cada push em `main`, depois de rodar a mesma verificação.

```sh
npm run foto -- fotos/tejo.webp "Late afternoon on the Tagus" --ampliada fotos/tejo-grande.webp --cidade Lisbon --pais Portugal --data 2026-10-15
```

No catálogo de trabalhos, use `title` e `src`. Também é possível informar `description`, `alt` para uma obra em imagem ou `poster` para um vídeo. No caso de vídeo, o endereço deve apontar para o arquivo reproduzível, como um MP4.

Para incluir uma obra em [Jobs](https://anizmabel.com/visual/jobs/), adicione um item à lista `"jobs"` de `site/visual/trabalhos.json`. Use o endereço HTTPS público do R2 em `src`. As entradas são exibidas na ordem do arquivo. Se o endereço for de um vídeo, acrescente `"type": "video"`.

## Arquivos por país

O [mapa-múndi](https://anizmabel.com/visual/map/) usa o campo `country` de `site/visual/fotos.json`. Por exemplo, uma foto com `"country": "Portugal"` aparece na galeria principal e no [arquivo de Portugal](https://anizmabel.com/visual/map/country/?country=PT).

Para ligar uma publicação a um país, acrescente um item à lista `video`, `musica` ou `texto` de `site/visual/mapa/conteudos.json`. Informe `country`, `title` e `href`. Em `country`, use o nome em inglês ou o código de duas letras. Em `href`, use o endereço da publicação, como `/writing/` ou um link público HTTPS.

Escreva os títulos, descrições e nomes de lugares em inglês para novas publicações.
