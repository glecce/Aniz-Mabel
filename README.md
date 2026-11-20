# Aniz Mabel

Portfólio estático em `site/alternativa/`, com fotografia, vídeo, colagem e pinturas e desenhos. A página inicial em `site/index.html` redireciona para `/alternativa/`.

## Visualizar localmente

Na pasta do projeto, execute:

```sh
python3 -m http.server 8787 --bind 127.0.0.1 --directory site
```

Abra [o portfólio](http://127.0.0.1:8787/alternativa/). Para encerrar o servidor, pressione Ctrl+C.

## Fotografias

O catálogo `site/alternativa/fotos.json` define a ordem das fotografias, os textos e os dados técnicos. As 30 miniaturas e as 30 versões para ampliação ficam em `site/assets/fotos/alternativa/`. Cada entrada usa `src` para a miniatura e `full` para a ampliação.

## Outros trabalhos

As páginas de Vídeo, Colagem e Pinturas e desenhos leem `site/alternativa/trabalhos.json`. Adicione itens à coleção correspondente com `title` e `src`, e opcionalmente `description`, `alt` (para imagens) ou `poster` (para vídeo). Os catálogos estão vazios e as páginas mostram “Trabalhos em seleção”.

Use arquivos em `/assets/` ou endereços HTTPS. Para vídeos, `src` deve apontar para o próprio arquivo reproduzível, como um MP4.

## Publicar com GitHub e Cloudflare Pages

### Configuração inicial

1. Envie este repositório para um repositório GitHub dedicado, de preferência privado. No VS Code, abra **Controle de código-fonte** e escolha **Publish to GitHub**. Use a conta `glecce` e, se o nome estiver disponível, crie `aniz-mabel`.
2. No painel do Cloudflare, abra **Workers & Pages → Create application → Pages → Connect to Git**. Autorize o acesso somente ao repositório deste portfólio e selecione-o.
3. Use estas configurações:

   | Campo | Valor |
   |---|---|
   | Ramo de produção | `main` |
   | Preset de framework | Nenhum |
   | Comando de build | `npm run check` |
   | Diretório de saída | `site` |
   | Diretório raiz | Raiz do repositório |

4. Depois que o endereço `pages.dev` funcionar, abra **Custom domains → Set up a domain** no projeto Pages e adicione `anizmabel.com`. O domínio precisa estar ativo na mesma conta Cloudflare. Se o painel indicar um registro existente no domínio, confira o serviço atual antes de trocar o apontamento.
5. No [painel do R2](https://dash.cloudflare.com/?to=/:account/r2/overview), crie um bucket dedicado às cópias públicas para web. Em **Settings → Custom Domains**, adicione `media.anizmabel.com`. A configuração ativa publica os objetos desse bucket. Guarde originais e rascunhos separadamente.

**Publicação automática.** Cada push em `main` roda a verificação e publica a pasta `site/`. A raiz do domínio leva à galeria em `/alternativa/`.

[Integrar o Git ao Cloudflare Pages](https://developers.cloudflare.com/pages/get-started/git-integration/) · [Vincular o domínio ao Pages](https://developers.cloudflare.com/pages/configuration/custom-domains/) · [Vincular um subdomínio ao R2](https://developers.cloudflare.com/r2/buckets/public-buckets/#connect-a-bucket-to-a-custom-domain)

### Adicionar uma foto à galeria

1. No R2, faça upload de uma cópia leve para web. Se quiser, envie também a versão ampliada. Use nomes distintos a cada nova versão de uma imagem, por exemplo `fotos/tejo-v2.webp`, para evitar cache antigo.
2. No terminal do VS Code, cadastre a chave do arquivo. Pode usar uma URL pública HTTPS completa no mesmo lugar:

   ```sh
   npm run foto -- fotos/tejo.webp "Fim de tarde no Tejo" --ampliada fotos/tejo-grande.webp --cidade Lisboa --pais Portugal
   ```

   O comando usa `https://media.anizmabel.com` como base para as chaves do R2 e adiciona a foto no início de `site/alternativa/fotos.json`. Para ver todas as opções, rode `npm run foto -- --help`. Os campos técnicos são opcionais e aparecem como “Não registrado” quando ausentes. Você também pode editar o JSON diretamente.
3. Abra o endereço público da imagem no navegador e confira a prévia local. Rode `npm run check` para validar o catálogo e os arquivos do projeto.
4. Faça commit do catálogo e envie a mudança ao GitHub, ou use **Commit** e **Sync Changes** no VS Code. Com Pages conectado, o site atualiza sozinho.

```sh
git add site/alternativa/fotos.json
git commit -m "Adicionar foto do Tejo"
git push
```

[Como enviar arquivos pelo painel do R2](https://developers.cloudflare.com/r2/objects/upload-objects/#upload-via-dashboard)
