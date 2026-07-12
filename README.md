# Masterclass A. Charly

Projeto independente da landing page executiva da StepUp & Company, direcionada a CEOs e fundadores.

## Objetivo

Converter visitantes que ainda nao conhecem Harold Mesa em registros qualificados para a masterclass, usando uma experiencia sofisticada, clara e orientada por confianca.

## Abrir a landing

Abra `src/index.html` no navegador. A pagina funciona localmente sem servidor.

## Publicacao

Dominio de producao planejado: `ceo.stepupandco.com`.

O projeto usa `src/` como codigo-fonte e `public/` como pacote de publicacao para a Hostinger. Gere o pacote com:

```sh
sh scripts/prepare-public.sh
```

O workflow `.github/workflows/deploy-hostinger.yml` publica `public/` na Hostinger quando houver push para `main`, desde que os secrets FTP/SFTP estejam configurados no GitHub.

Leia `docs/publication-workflow.md` antes de conectar o remoto ou publicar.

## Estrutura

- `src/index.html`: estrutura, conteudo e formulario.
- `src/styles.css`: direcao visual e responsividade.
- `src/script.js`: video, formulario e interacoes.
- `assets/`: logos e fotografias reais de Harold Mesa.
- `docs/masterclass-content-and-landing-strategy.md`: estrategia de conteudo.
- `docs/landing-content-models-stepup.md`: modelos segmentados.
- `docs/source-extracts.txt`: extracoes do material original.
- `docs/conversion-blueprint.md`: arquitetura de conversao.
- `docs/publication-workflow.md`: operacao GitHub -> Hostinger -> dominio.
- `scripts/prepare-public.sh`: gera a pasta `public/` para deploy.
- `.github/workflows/deploy-hostinger.yml`: deploy automatico para Hostinger via GitHub Actions.

## Estado atual

- Modelo ativo: CEO e fundador.
- Video em primeiro lugar, com poster real de Harold.
- Layout responsivo para desktop e mobile.
- Formulario ainda funciona apenas como simulacao local.
- Repositorio Git local iniciado.
- Repositorio remoto GitHub alvo: `nquisinski1/CEO.Masterclass2026`.
- Dominio alvo definido: `ceo.stepupandco.com`.
- Deploy automatico preparado, mas dependente dos secrets da Hostinger no GitHub.

## Antes de publicar

1. Inserir o video oficial.
2. Validar documentalmente as credenciais publicas de Harold.
3. Adicionar depoimentos ou casos autorizados.
4. Confirmar data, horario, fuso e politica de gravacao.
5. Conectar formulario, CRM, consentimento e pagina de confirmacao.
6. Fazer revisao visual final em desktop e mobile.
