---
id: WP-212
title: "Reset de modo_bot al inicio del canvas, con centinela si Set no admite cadena vacía"
status: specified
size: S
depends_on: [WP-209, WP-210]
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

WP-209 (observación `RESET_OK`/`RESET_FALLA`), WP-210.

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
