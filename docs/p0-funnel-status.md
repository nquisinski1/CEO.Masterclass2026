# Status P0 - LP CEO

Auditado em: `2026-07-13`

Padrao aplicavel: `../../LANDING_PAGE_FUNNEL_STANDARD.md`

## Resumo

Esta LP nao esta liberada para trafego. Ha implementacao preparatoria no frontend, mas o fluxo nao foi verificado ponta a ponta.

| Area | Estado | Evidencia atual | Falta para VERIFIED |
|---|---|---|---|
| P0.0 GHL | `BLOCKED_ACCOUNT` | Submit real preparado, dados preservados em erro e thank-you criada | Endpoint GHL aprovado, upsert unico, workflow unico e teste ponta a ponta |
| P0.1 Meta | `IMPLEMENTED_UNVERIFIED` | Pixel permitido travado no frontend; `Lead` apos resposta GHL; `event_id` enviado no payload; P1 declara `QualifiedApplication` como otimizador somente no P2 | Confirmar CAPI servidor com mesmo `event_id`, dedup e EMQ; validar que Events Manager otimiza apenas `QualifiedApplication` |
| P0.2 Atribuicao | `IMPLEMENTED_UNVERIFIED` | First/last touch, UTMs, IDs, `_fbp` e `_fbc` preparados | Confirmar persistencia no contato GHL e tabela dos 15 criativos |
| P0.3 GTM/GA4 | `BLOCKED_ACCOUNT` | Eventos no dataLayer preparados | IDs GTM/GA4, configuracao, DebugView e auditoria sem PII |
| P0.4 Privacidade | `BLOCKED_ACCOUNT` | Banner, separacao de opt-in e rascunho de aviso existem | Aprovacao juridica LFPDPPP, politica final de tags e teste de consentimento |
| QA P0 | `NOT_STARTED` | Nenhuma evidencia de ambiente real anexada | Executar integralmente o gate do padrao central |

## Bloqueios de conta

- URL do endpoint GHL aprovado.
- Regra de upsert/idempotencia do contato.
- Workflow de confirmacao e lembretes.
- Confirmacao se GHL-native CAPI transporta o `event_id` do navegador.
- Decisao final de consentimento: PageView automatico no load versus tags Meta/GA4/GTM condicionadas ao banner.
- IDs e configuracao de GTM/GA4.
- Custom conversion criada manualmente no Events Manager.
- Aviso LFPDPPP aprovado.
- Mapeamento oficial dos 15 IDs criativos.
