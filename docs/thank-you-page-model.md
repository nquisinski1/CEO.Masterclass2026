# Modelo de pagina de agradecimento

> **Substituido como fonte de producao:** o projeto exclusivo da campanha agora esta em `../../masterclass-a-charly-thank-you`. Este arquivo documenta apenas o prototipo local anterior da LP de CEO.

Arquivo principal: `src/thank-you.html`

## Objetivo

Transformar a confirmacao do registro em uma segunda etapa de relacionamento. A pagina confirma o acesso, orienta o participante, entrega valor antes da masterclass e apresenta a StepUp sem disparar uma nova conversao `Lead`.

## Estrutura

1. Confirmacao clara do registro.
2. Dados da sessao carregados por `config.js`.
3. VSL prioritario com poster real de Harold.
4. Tres acoes para proteger o acesso.
5. Mini diagnostico com tres perguntas.
6. Mapa da sessao: cinco forcas, sete pilares e uma prioridade.
7. Apresentacao da StepUp, ASM e StepUp OS.
8. CTA P2 opcional, oculto enquanto nao houver URL aprovada.
9. Link para aviso de privacidade.

## Configuracao

Editar somente `src/config.js`:

```js
thankYou: {
  vslYoutubeId: "ID_DE_11_CARACTERES",
  p2QualifierUrl: "https://URL-APROVADA-DO-P2"
}
```

- `vslYoutubeId`: ID do YouTube, nao a URL completa. O embed usa `youtube-nocookie.com` e so carrega depois do clique.
- `p2QualifierUrl`: opcional. O botao fica oculto quando o valor esta vazio.

## Medicao

- `thank_you_viewed`: uma vez quando a pagina e carregada pelo fluxo.
- `vsl_started`: quando o usuario inicia o VSL.
- A pagina nao dispara `Lead`.
- Nenhum dado pessoal e enviado ao dataLayer.

## Pendencias antes de publicar

- Inserir o ID do VSL oficial.
- Confirmar data, hora e texto de proximo passo.
- Garantir que o GHL redirecione apenas depois de registro confirmado.
- Validar acesso direto, refresh e back sem duplicar `Lead`.
- Configurar P2 somente quando a rota de qualificacao estiver aprovada.
- Revisar a copy e o aviso LFPDPPP.
