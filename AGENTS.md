# Instrucoes do projeto

## Objetivo original

Construir uma landing page executiva de alta conversao para a Masterclass A. Charly da StepUp & Company. A conversao primaria e o registro de CEOs, fundadores e donos de empresas que ainda podem nao conhecer Harold Mesa.

## Padrao central obrigatorio

Antes de alterar formulario, tracking, consentimento, thank-you, publicacao ou analytics, ler:

`../LANDING_PAGE_FUNNEL_STANDARD.md`

Esse documento substitui qualquer instrucao anterior conflitante. O status local deve ser atualizado em `docs/p0-funnel-status.md`.

## Direcao atual

- Pagina publica em espanhol.
- Colaboracao e revisoes com Nina em portugues.
- Visual executivo, editorial e sofisticado.
- Video como primeiro elemento de conteudo.
- Fotografias e logos reais da StepUp.
- Uma promessa central: crescer sem depender da presenca constante do CEO.

## Regras inegociaveis

1. Nao inventar numeros, depoimentos, clientes, premios ou resultados.
2. Validar as credenciais `25+ anos`, `US$1B+`, `47 paises` e `Fortune 500` antes da publicacao.
3. Nao cobrir o rosto de Harold com texto, botoes ou o controle de reproducao.
4. Manter o video grande e prioritario em desktop e mobile.
5. Evitar texto repetido, secoes genericas e excesso de cards.
6. Usar um CTA principal consistente: `Reservar mi lugar gratis`.
7. Nao publicar, criar remoto ou enviar ao GitHub sem aprovacao explicita.
8. Nao apresentar o formulario como funcional ate integrar e verificar o GHL ponta a ponta.
9. Nao enviar trafego enquanto qualquer requisito P0 nao estiver `VERIFIED`.
10. Nunca usar `Lead` como evento de otimizacao; `QualifiedApplication` no P2 e o unico otimizador.
11. Nunca enviar PII para GA4, GTM ou dataLayer.
12. Nao alterar IDs Meta travados sem decisao humana documentada.

## Criterios de conversao

O primeiro percurso deve responder rapidamente:

- Isto e para mim?
- Por que devo confiar em Harold?
- O que vou aprender ou conseguir identificar?
- Qual e o proximo passo?

## Validacao obrigatoria

- Um unico `h1`.
- Sem overflow horizontal em 360 px.
- Alvos de toque com pelo menos 44 px.
- Video em proporcao estavel `16:9`.
- Contraste WCAG AA.
- Formulario testado no teclado e no celular.
- `node --check src/script.js`.
- `git diff --check`.

## Arquivos principais

- `src/index.html`
- `src/styles.css`
- `src/script.js`
- `docs/masterclass-content-and-landing-strategy.md`
- `docs/landing-content-models-stepup.md`

## Estado de publicacao

Projeto em revisao local. O frontend do funil esta parcialmente preparado, mas o P0 ainda nao esta verificado. Consultar `docs/p0-funnel-status.md` antes de qualquer deploy ou trafego.

## Operacao GitHub e Hostinger

- Dominio alvo: `ceo.stepupandco.com`.
- Editar sempre os arquivos-fonte em `src/` e `assets/`.
- Antes de publicar, gerar o pacote com `sh scripts/prepare-public.sh`.
- A pasta `public/` e o artefato de publicacao para a Hostinger.
- O deploy automatico esperado e GitHub Actions para Hostinger via FTP/SFTP.
- Nunca gravar credenciais da Hostinger, CRM, email ou GitHub no repositorio.
- Se a pagina online divergir do codigo local, verificar primeiro `git status`, ultimo commit em `main`, log do GitHub Actions e pasta remota configurada na Hostinger.
