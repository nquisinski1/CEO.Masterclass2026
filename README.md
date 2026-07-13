# Masterclass A. Charly

Projeto independente da landing page executiva da StepUp & Company, direcionada a CEOs e fundadores.

## Objetivo

Converter visitantes que ainda nao conhecem Harold Mesa em registros qualificados para a masterclass, usando uma experiencia sofisticada, clara e orientada por confianca.

## Abrir a landing

Abra `src/index.html` no navegador. A pagina funciona localmente sem servidor.

## Publicacao

Dominio de producao planejado: `ceo.stepupandco.com`.

O projeto usa `src/` como codigo-fonte. A Hostinger publica a raiz do repositorio, entao `index.html`, `styles.css` e `script.js` na raiz sao copias geradas para deploy. Gere/atualize esses arquivos com:

```sh
sh scripts/prepare-public.sh
```

O workflow `.github/workflows/deploy-hostinger.yml` tambem pode publicar `public/` na Hostinger quando houver push para `main`, desde que os secrets FTP/SFTP estejam configurados no GitHub.

Leia `docs/publication-workflow.md` antes de conectar o remoto ou publicar.

## Estrutura

- `src/index.html`: estrutura, conteudo e formulario.
- `src/styles.css`: direcao visual e responsividade.
- `src/script.js`: video, formulario e interacoes.
- `src/config.js`: IDs e endpoints de mensuracao, GHL, Meta, GA4 e GTM.
- `src/thank-you.html`: pagina de confirmacao pos-registro.
- `src/privacy.html`: aviso de privacidade a ser aprovado juridicamente.
- `index.html`, `styles.css`, `script.js`: copias geradas para a Hostinger servir pela raiz do repositorio.
- `assets/`: logos e fotografias reais de Harold Mesa.
- `docs/masterclass-content-and-landing-strategy.md`: estrategia de conteudo.
- `docs/landing-content-models-stepup.md`: modelos segmentados.
- `docs/source-extracts.txt`: extracoes do material original.
- `docs/conversion-blueprint.md`: arquitetura de conversao.
- `docs/p0-funnel-status.md`: estado verificavel do funil e bloqueios de conta.
- `docs/publication-workflow.md`: operacao GitHub -> Hostinger -> dominio.
- `docs/funnel-implementation.md`: arquitetura P0 de tracking, GHL, consentimento e QA.
- `scripts/prepare-public.sh`: gera a pasta `public/` e atualiza os arquivos estaticos da raiz.
- `.github/workflows/deploy-hostinger.yml`: deploy automatico para Hostinger via GitHub Actions.

## Estado atual

- Modelo ativo: CEO e fundador.
- Video em primeiro lugar, com poster real de Harold.
- Layout responsivo para desktop e mobile.
- Formulario GHL oficial incorporado via iframe: `LP/CEO.stepupandco`.
- Fluxo GHL, contato unico, workflow, CAPI/dedup e thank-you ainda precisam ser verificados ponta a ponta.
- Repositorio Git local iniciado.
- Repositorio remoto GitHub alvo: `nquisinski1/CEO.Masterclass2026`.
- Dominio alvo definido: `ceo.stepupandco.com`.
- Deploy automatico preparado, mas dependente dos secrets da Hostinger no GitHub.

## Antes de publicar

O gate tecnico obrigatorio esta em `../LANDING_PAGE_FUNNEL_STANDARD.md`. O estado desta LP esta em `docs/p0-funnel-status.md`.

1. Levar todos os itens P0 ao estado `VERIFIED`.
2. Inserir o video oficial.
3. Validar documentalmente as credenciais publicas de Harold.
4. Adicionar depoimentos ou casos autorizados.
5. Confirmar data, horario, fuso e politica de gravacao.
6. Fazer revisao visual final em desktop e mobile.
