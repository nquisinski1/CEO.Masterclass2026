# Fluxo de publicacao

## Objetivo

Manter a landing `ceo.stepupandco.com` ajustavel a partir deste projeto no Codex, versionada no GitHub e publicada na Hostinger sem editar arquivos diretamente no painel da hospedagem.

## Arquitetura decidida

- Fonte de verdade: este repositorio Git, pasta `masterclass-a-charly`.
- Repositorio GitHub: `nquisinski1/CEO.Masterclass2026`.
- Codigo editavel: `src/index.html`, `src/styles.css`, `src/script.js` e `assets/`.
- Pacote publicado: arquivos estaticos na raiz do repositorio (`index.html`, `styles.css`, `script.js`) e, quando usado por workflow FTP, `public/`.
- Dominio de producao: `ceo.stepupandco.com`.
- Deploy recomendado: Hostinger Git Deploy serve a raiz do repositorio. O workflow GitHub Actions pode enviar `public/` por FTP/SFTP se essa rota for ativada depois.

## Secrets necessarios no GitHub

Configurar em `Settings > Secrets and variables > Actions`:

- `HOSTINGER_FTP_SERVER`: servidor FTP/SFTP informado pela Hostinger.
- `HOSTINGER_FTP_USERNAME`: usuario FTP/SFTP do dominio.
- `HOSTINGER_FTP_PASSWORD`: senha ou token FTP/SFTP.
- `HOSTINGER_FTP_SERVER_DIR`: diretorio remoto do dominio, por exemplo `/public_html/ceo.stepupandco.com/` ou o caminho exato exibido no hPanel.

Nao salvar credenciais em arquivos do projeto.

## Como editar daqui em diante

1. Abrir este projeto no Codex pela pasta `/Volumes/Toshiba/CODEX.CODE /Agencia 007/masterclass-a-charly`.
2. Pedir ajustes nesta conversa/projeto.
3. Validar localmente.
4. Gerar os arquivos estaticos de deploy com `sh scripts/prepare-public.sh`.
5. Commitar e enviar para `main`.
6. O GitHub Actions publica automaticamente na Hostinger.
7. Conferir `https://ceo.stepupandco.com`.

## Bloqueios antes de publicar como pagina final

- Cumprir e verificar integralmente `../../LANDING_PAGE_FUNNEL_STANDARD.md`.
- Atualizar `p0-funnel-status.md` com evidencias; nenhum item pode permanecer abaixo de `VERIFIED`.
- Conectar o video oficial.
- Validar documentalmente as credenciais publicas de Harold.
- Confirmar data, horario, fuso e politica de gravacao.
- Revisar visual em desktop e mobile.

## Criterio de aceite

Uma alteracao feita no projeto local deve chegar ao GitHub em `main`, acionar o workflow `Deploy landing to Hostinger` e atualizar `https://ceo.stepupandco.com` sem edicoes manuais na Hostinger. Deploy tecnico nao autoriza trafego: o P0 precisa estar `VERIFIED` separadamente.
