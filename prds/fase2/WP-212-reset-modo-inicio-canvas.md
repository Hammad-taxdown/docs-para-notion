---
id: WP-212
title: "Reset de modo_bot al inicio del canvas, con centinela si Set no admite cadena vacía"
status: specified
size: S
depends_on: [WP-210]
milestone: "Fase 2 conversacional — Modo y menú"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-212 — Reset de `modo_bot`

> HECHO VERIFICADO: si el contacto tiene una conversación abierta, el Messenger **la reanuda** y el
> usuario **no vuelve a ver el menú** → arrastraría el modo viejo (modo de fallo MF3). Sin reset, MF3
> es certeza, no riesgo.

> **26/08 · ESTE PAQUETE DEPENDE DE `T081` Y CON UNA DE LAS DOS RAMAS DESAPARECE ENTERO.**
> Escrito para las dos, para que la decisión no arrastre reescritura:
>
> | Si `T081` sale… | Qué pasa con este WP |
> |---|---|
> | **B pura** *(recomendada)* | **Se cierra sin construir.** Si el modo no se persiste, **no hay nada que resetear**: ni `modo_bot`, ni el problema de si `Set` admite cadena vacía, ni el centinela. Lo único que sobrevive es la limpieza de `faq_turnos_bot` e `intentos_fecha_bot`, que **son contadores y siguen siendo atributos** — y eso son dos pasos `Set`, no un paquete |
> | **B híbrida** | Se construye **solo para `modo_bot`**, y vuelve a necesitar saber si `Set` admite vacío… que es justo la incógnita que mató a `WP-209` |
>
> **Y su §3 está obsoleta:** dice depender de `WP-209`, que está **muerta desde el 14/08**. Con
> transporte B esa dependencia no existe — el `depends_on` de la cabecera ya sólo lleva `WP-210`.
>
> **Lo que NO cambia en ninguna rama:** los `*_f2` no los resetea este paso, y los dos contadores hay
> que limpiarlos igual. Si sale B pura, este PRD se cierra y **esos dos `Set` se mudan a `WP-216`**,
> que ya está tocando el canvas.

## 1. Objetivo

Que ninguna sesión herede el modo de una sesión anterior.

## 2. Alcance

**In:**
- Paso `Set modo_bot` (vacío, o centinela si la sonda demostró que `Set` no admite cadena vacía)
  **antes de cualquier branch**, en el path de bienvenida.
- Misma limpieza para `faq_turnos_bot` e `intentos_fecha_bot`.
- Si el reset por atributo no es viable: TTL como **Text ISO** parseado en n8n (los `Date` de Intercom
  no sirven en workflows, HECHO VERIFICADO) comparado con la fecha de la primera part de la sesión.

**Out:**
- El trigger `Reopened` y la matriz de reentrada → WP-227.
- Los `*_f2`: se resetean por la reentrada del canvas, no por este paso.

## 3. Dependencias

**WP-210.** *(Antes también `WP-209`, que está muerta desde el 14/08: con transporte B esa
dependencia desaparece.)*

## 4. Entregables

1. Paso de reset publicado en `OnClick Mobility`, con backup previo.
2. Decisión registrada: cadena vacía o centinela.

## 5. Verificación

- Con el contacto de e2e: primera conversación llega a `faq_regimen`; **segunda** conversación del
  mismo contacto (tras cerrar la primera y esperar el cooldown de 2 min) muestra `modo_bot`
  vacío/centinela en `get_conversation` **antes** del primer branch.
- Escenario de hilo reanudado: documentado con su par (conversación, ejecución) aunque el resultado
  sea que el usuario no ve el menú — es el caso que WP-227 debe cubrir.

## 6. Riesgo

Medio: si `Set` no admite cadena vacía y el centinela no se contempla en **todos** los consumidores,
el centinela se interpretará como un modo desconocido y disparará el fail-closed en cada sesión nueva.
Mitigación: el centinela se añade explícitamente al contrato de WP-210 como equivalente de vacío.

## 7. Rollback

Duplicado `OnClick Mobility — BACKUP AAAAMMDD` antes de publicar; se republica el backup.
