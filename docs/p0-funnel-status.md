# Status P0 - LP CEO

Auditado em: `2026-07-13`

Padrao aplicavel: `../../LANDING_PAGE_FUNNEL_STANDARD.md`

## Resumo

Esta LP nao esta liberada para trafego. Ha implementacao preparatoria no frontend, mas o fluxo nao foi verificado ponta a ponta.

| Area | Estado | Evidencia atual | Falta para VERIFIED |
|---|---|---|---|
| P0.0 GHL | `IMPLEMENTED_UNVERIFIED` | Form oficial GHL `LP/CEO.stepupandco` incorporado via iframe | Confirmar upsert unico, workflow unico, sucesso/erro, thank-you e teste ponta a ponta dentro do GHL |
| P0.1 Meta | `IMPLEMENTED_UNVERIFIED` | Pixel permitido travado no frontend; `ViewContent` removido; P1 declara `QualifiedApplication` como otimizador somente no P2 | Confirmar como o embed/GHL dispara `Lead`, CAPI servidor, dedup e EMQ; validar que Events Manager otimiza apenas `QualifiedApplication` |
| P0.2 Atribuicao | `IMPLEMENTED_UNVERIFIED` | First/last touch, UTMs, IDs, `_fbp` e `_fbc` preparados | Confirmar persistencia no contato GHL e tabela dos 15 criativos |
| P0.3 GTM/GA4 | `BLOCKED_ACCOUNT` | Eventos no dataLayer preparados | IDs GTM/GA4, configuracao, DebugView e auditoria sem PII |
| P0.4 Privacidade | `BLOCKED_ACCOUNT` | Banner, separacao de opt-in e rascunho de aviso existem | Aprovacao juridica LFPDPPP, politica final de tags e teste de consentimento |
| QA P0 | `NOT_STARTED` | Nenhuma evidencia de ambiente real anexada | Executar integralmente o gate do padrao central |

## Bloqueios de conta

- Regra de upsert/idempotencia do contato.
- Workflow de confirmacao e lembretes.
- Confirmacao se o formulario embed/GHL-native CAPI consegue deduplicar browser/server `Lead`.
- Decisao final de consentimento: PageView automatico no load versus tags Meta/GA4/GTM condicionadas ao banner.
- IDs e configuracao de GTM/GA4.
- Custom conversion criada manualmente no Events Manager.
- Aviso LFPDPPP aprovado.
- Mapeamento oficial dos 15 IDs criativos.
