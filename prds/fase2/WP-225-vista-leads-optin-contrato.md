---
id: WP-225
title: "Vista Leads potenciales, opt-in explícito trazable y contrato de datos para el tercero"
status: specified
size: M
depends_on: [WP-224]
milestone: "Fase 2 conversacional — Leads"
owner: "Hammad"
external: "Dueño del seguimiento de leads (decisiones M1, M2, M3)"
critical: true
issue: ""
---

# PRD · WP-225 — Vista, opt-in y contrato de datos

> HECHO VERIFICADO: la vista de Airtable "Leads potenciales", **aceptada el 28/07, nunca se
> construyó**: solo hay `Grid view` + 4 vistas form. Era la entrega acordada.
> DECISIÓN APROBADA: **opt-in explícito obligatorio** — un recordatorio diferido a quien dijo "todavía
> no estoy de alta" es comunicación comercial, no interés legítimo automático, y **no existe hoy ningún
> campo de consentimiento**. La rama `Q` guarda el lead y **no programa nada** sin un Sí.
> Es la **Variante B** recomendada por el Chairman: el equipo del bot construye **solo el registro** y
> entrega un contrato de datos. **BLOQUEADO en su alcance final por M1, M2 y M3.**

## 1. Objetivo

Dejar los leads visibles, con consentimiento trazable, y con un contrato escrito que impida que un
tercero envíe sin comprobarlo.

## 2. Alcance

**In:**
- Vista `Leads potenciales`: `lead_potencial=true AND Descarte vacío AND recordatorio_optout=false`.
- Vistas de revisión humana: `leads sin fecha` y `leads agotados`.
- Campos de consentimiento: `recordatorio_optin`, `recordatorio_optin_fecha`,
  `recordatorio_optin_corr_id`, `recordatorio_optout`, `recordatorio_intentos`,
  `recordatorio_ultimo_envio`.
- Pregunta de opt-in con Sí/No ("¿quieres que te avisemos cuando se acerque esa fecha?"); **solo el Sí**
  marca `recordatorio_optin=true`, con su `corr_id`.
- Contrato escrito para el tercero: definición de cada campo, semántica de
  `precision_fecha_prevista`, qué significa opt-in, **"no enviar sin `recordatorio_optin=true`"**, qué
  campos le quedan reservados (`recordatorio_intentos`, `recordatorio_ultimo_envio`) y la prohibición
  del resto. Aviso explícito de que la automatización ajena `wflo1oMmSWlcYsO3V` **reacciona a
  escrituras creando filas hijas** (HECHO VERIFICADO).

**Out:**
- Scheduler, cadencia, envíos, reintentos y purga → WP-230 (Variante A), solo si M1 los mete en alcance.
- Retención: **PROPUESTA** de 12 meses desde el último contacto, pendiente de M3.

## 3. Dependencias

WP-224. Decisiones abiertas **M1** (alcance), **M2** (dueño nombrado), **M3** (base legal y retención).

## 4. Entregables

1. Las tres vistas creadas.
2. Los seis campos de consentimiento creados.
3. `docs/contratos/leads_seguimiento.md` con el contrato de datos.

## 5. Verificación

- Un lead que dijo **No** al opt-in: aparece en `Leads potenciales`, y `recordatorio_optin` está
  **vacío o false** (nunca true por defecto).
- Un lead que dijo **Sí**: `recordatorio_optin=true` con `recordatorio_optin_fecha` y
  `recordatorio_optin_corr_id` rellenos, y desde ese `corr_id` se llega a la conversación.
- `registrar_optout` sobre ese lead lo **saca** de la vista `Leads potenciales`.
- El contrato está firmado por el dueño nombrado en M2. **Sin dueño nombrado, el WP no cierra.**

## 6. Riesgo

**Crítico legal (RGPD)** si alguien envía sin comprobar el opt-in: el riesgo vuelve al proyecto aunque
el envío sea de un tercero. Riesgo de dato: segundo escritor de facto sobre `recordatorio_*`; la
propiedad "por columnas" **no es enforceable** (Airtable no tiene constraints ni bloqueo de fila) → se
reserva por escrito, sabiendo que es un acuerdo, no una garantía técnica.

## 7. Rollback

Las vistas se borran sin pérdida de datos. Los campos de consentimiento no se borran (son la traza del
consentimiento).
