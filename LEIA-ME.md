# Site do Hinário nº 5 em Fingerstyle

## 1. Ajuste seus dados (arquivo `config.js`)
- `whatsapp`: seu número com 55 + DDD (ex.: `5511999998888`)
- `pix.chave` e `pix.nome`
- `precoAvulso` e `precoCompleto` (os valores que vêm são só exemplos)

Para mostrar o nome dos outros hinos na busca, acrescente linhas em `hinos.js`.

## 2. Publicar de graça no GitHub Pages (pelo celular)
1. Crie um repositório (ex.: `hinario5`) e envie **todos** os arquivos desta pasta, inclusive `.nojekyll` e a pasta `.well-known`.
2. Em **Settings → Pages**, escolha *Deploy from a branch* → `main` → `/ (root)`.
3. O endereço será `https://SEU-USUARIO.github.io/hinario5/`.

## 3. Virar app Android (TWA)
Um TWA exige o site em HTTPS (o GitHub Pages já serve) e a verificação Digital Asset Links.
1. Com o site no ar, abra https://www.pwabuilder.com, cole o endereço e gere o pacote **Android**.
   Use o package name `com.digitahinos.hinario5` (ou outro, mas igual ao do passo 3).
2. Baixe o pacote: ele traz o APK/AAB, o arquivo de chave (`signing.keystore`) e o **SHA-256** da chave.
   Guarde a chave: sem ela você não consegue atualizar o app.
3. Edite `.well-known/assetlinks.json` com o package name e o SHA-256 recebidos e publique de novo.
   Sem isso o app abre com uma barra de endereço do navegador no topo.
4. Teste o APK no celular. Se não aparecer barra de endereço, o TWA está verificado.

Observação: o GitHub Pages serve o site em `usuario.github.io/hinario5/`, um subcaminho.
O `assetlinks.json` precisa estar na **raiz do domínio** (`usuario.github.io/.well-known/...`).
Por isso o ideal é um domínio próprio, ou um repositório chamado `SEU-USUARIO.github.io`.

## 4. Atualizar
Troque os arquivos no repositório. Se mudar imagens ou estilos, aumente `VERSAO` em `sw.js`
(ex.: `hinario5-v2`) para o celular baixar a versão nova.
