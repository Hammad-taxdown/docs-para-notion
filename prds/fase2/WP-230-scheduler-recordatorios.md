---
id: WP-230
title: "BECKHAM_recordatorios_leads: scheduler con cola derivada (solo si el manager mete los recordatorios en alcance)"
status: skeleton
size: L
depends_on: [WP-10, WP-225]
milestone: "Fase 2 conversacional — Pospuesto"
owner: "Sin asignar (decisión M2)"
external: "Manager (M1, M2, M3) · Adri / Fer vía WP-10"
critical: false
issue: ""
---

# PRD · WP-230 — Scheduler de recordatorios (Variante A)

> **BLOQUEADO por tres decisiones del manager y por WP-10.**
> Contradicción de alcance verificada: **WP-03 declara los recordatorios fuera de alcance de todo el
> proyecto ("lo hace otra persona")** y la Fase 2 pide construirlos. El Council **no puede resolver esa
> contradicción**: es decisión de negocio (M1).
> Recomendación del Chairman: **Variante B para el MVP** (solo registro + vista + opt-in → WP-225), y
> esta Variante A como fase posterior si el tercero no aparece o si se quiere control del envío.
> Aguas abajo de **WP-10** en cualquier variante: la acción principal de un recordatorio es un **mensaje
> proactivo**, y una conversación nueva es justo lo que se convirtió en `Customer ticket`, cuyo paso a
> `Submitted` **manda correo al cliente** (HECHO VERIFICADO).
> Queda `skeleton` a propósito: sin dueño nombrado y sin base legal aprobada, especificarlo sería
> planificar una automatización huérfana por diseño.

## 1. Objetivo

Enviar recordatorios acotados a los leads que dieron consentimiento, sin duplicados y sin poder colgar
ninguna conversación.

## 2. Alcance

**In (si M1 lo mete en alcance):**
- Workflow n8n **independiente** con Schedule Trigger diario, PAT propio, sobre una **vista
  restringida**. Separado del canvas por unanimidad 4/4: un `Wait` de semanas dentro de `beckham_bot`
  dejaría ejecuciones `waiting` colgadas, no inspeccionables, compartiendo logs con la ruta donde hay un
  usuario esperando y un `wait_for_callback` con timeout.
- **Cola derivada**, no persistida: función pura de `ventana + precisión + intentos + último_envío`.
  Con ventana: `desde-14d`, `desde`, `hasta+30d`. Sin ventana: `D+30`, `D+90`, `D+180`.
- Revalidación de elegibilidad **en el instante del envío** (`optout=false`, `Descarte` vacío,
  `alta_ss=false`).
- Escribe **solo** `recordatorio_intentos` y `recordatorio_ultimo_envio`.
- Tope duro de **3 intentos**, ventana anti-ráfaga de 24 h por lead, granularidad **diaria** (el
  esquema no tiene ningún campo con hora: HECHO VERIFICADO).
- Salida **siempre por enlace al launcher**, nunca reabriendo el hilo viejo, nunca tocando
  `ticket.state`.
- Purga de retención con Schedule propio (PROPUESTA: 12 meses desde el último contacto).

**Out:**
- Tabla `Recordatorios` y locks: **descartados del MVP**; se reabren solo si aparece multicanal o
  exigencia formal de auditoría de envíos. El patrón de lock sin lease queda descartado por escrito: un
  crash dejaría el lead bloqueado para siempre y en silencio.
- Canal del recordatorio: **decisión abierta U5** (mensaje proactivo, email o tarea humana).

## 3. Dependencias

**M1** (alcance), **M2** (dueño nombrado), **M3** (base legal, opt-in, retención), **WP-10**, WP-225.
Y las precondiciones técnicas, **ninguna negociable**: WP-201, WP-202, WP-203, WP-205, vista creada.

## 4. Entregables

Por definir en `/prd:fill` si se abre. Mínimo: workflow, cola derivada, revalidación, tope, purga.

## 5. Verificación

- Un lead con `optin=true` y hito vencido recibe **un** mensaje; ejecutar el Schedule dos veces el mismo
  día produce **un solo** envío (ventana anti-ráfaga).
- Un lead con `optout=true`, con `Descarte`, o con `alta_ss=true` **no** recibe nada, comprobado en el
  instante del envío y no solo en la vista.
- Al tercer intento el lead sale de la vista y aparece en `leads agotados`.
- Ningún envío reabre un hilo ni cambia `ticket.state`.

## 6. Riesgo

**Crítico legal (RGPD)** sin opt-in, sin tope o sin retención. Riesgo operativo: sin dueño nombrado los
leads acumulan sin nadie que los mire. Contingencia: parar el Schedule Trigger, o directamente no
construirlo (Variante B).

## 7. Rollback

Pausar el Schedule Trigger. Al no haber cola persistida, no queda estado que limpiar.
