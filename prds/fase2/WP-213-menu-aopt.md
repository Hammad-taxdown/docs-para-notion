---
id: WP-213
title: "Menú AOPT: tres reply buttons más 'hablar con una persona' y las transiciones de entrada"
status: specified
size: S
depends_on: [WP-212]
milestone: "Fase 2 conversacional — Modo y menú"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-213 — Menú `AOPT`

> DECISIÓN APROBADA: `A. Bienvenida` → **reset de `modo_bot`** (superado 27/08/2026: sin reset con el
> transporte B — ver nota de abajo) → `AOPT` con `Comprobar si cumplo` ·
> `Calcular mi ahorro` · `Tengo preguntas` **+ `Hablar con una persona`**. La opción
> "no creo que cumpla" **se retira del menú** (cerrar por una autoevaluación sin datos quema un lead)
> y se ofrece dentro del FAQ.
> DESCONOCIDO: el máximo real de reply buttons por paso. **No se citan cifras sin fuente**; si 4 no
> caben, se prioriza en ese orden. INVARIANTE incómoda declarada: **el menú no es un punto de entrada
> garantizado** (HECHO VERIFICADO: el Messenger reanuda el hilo abierto).

> **CORREGIDO 27/08/2026 — transporte B (WP-210 §2.2, reescrito el 26/08).** Este PRD mandaba un
> reset previo y un paso `Set modo_bot` por rama (transporte A). Vigente: **cada rama del menú declara
> `modo` como input de su llamada al Data Connector** según la tabla §2.2 de WP-210, **sin pasos `Set`
> ni atributo, y sin reset** — `menu` es un valor explícito (WP-210 §2.1), no hay nada que resetear.
> T081 (abierta, B pura recomendada): con **B pura** no existe atributo alguno; con **B híbrida** el
> atributo cubriría solo la reentrada, nunca la escritura por rama. Un constructor del canvas nuevo
> (rebuild del 27/08) **no debe copiar pasos `Set`**. Corregidos abajo §2, §4, §5 y §6.

## 1. Objetivo

Cuatro salidas del menú que lleven al destino correcto y escriban la transición de entrada del modo,
sin que ninguna toque `ticket.state`.

## 2. Alcance

**In:**
- `AOPT` con los 3 botones + humano.
- Cada rama declara su `modo` como input de la llamada al Data Connector (tabla §2.2 de WP-210):
  `solicitud` · `calculadora` · `faq_regimen` · `humano` (corregido 27/08/2026; antes: un paso
  `Set modo_bot` por rama — transporte A).
- Colector activo mientras el workflow posea el slot, para que el texto libre no caiga en el
  distribuidor ajeno (HECHO VERIFICADO: los reply buttons **no impiden** escribir en el composer; se
  declara que esta mitigación es **probabilística**, no un aislamiento).

**Out:**
- El contenido de cada rama → WP-214 (calculadora), WP-215 (autodescarte), WP-221 (FAQ),
  WP-216 (solicitud ya existente), WP-223 (humano).
- Multi-turno → WP-228.

## 3. Dependencias

WP-212 (el reset va antes del menú, en el mismo path).

## 4. Entregables

1. `AOPT` publicado con las cuatro salidas, cada una declarando su `modo` en la llamada al DC
   (corregido 27/08/2026; antes: «y sus pasos `Set`»).
2. Prueba visual del número de botones que caben (cierra la incógnita 9).

## 5. Verificación

- Matriz de **4 recorridos** en conversación no-Preview, cada uno con su par
  (`conversation_id`, `execution_id`): la rama pulsada coincide con el `modo` recibido como input en
  la ejecución de n8n (corregido 27/08/2026; antes: con el `modo_bot` leído después por
  `get_conversation` — transporte A).
- En los 4 recorridos, `ticket` sigue siendo el mismo valor que al nacer la conversación: **ninguna
  rama cambia `ticket.state`**.
- Captura anotada del menú en móvil y en escritorio.

## 6. Riesgo

Medio: si `Set` no admite literales (incógnita 2, con **contradicción documental** entre el briefing y
`.spartax/log.md`), cada rama necesita un paso previo y el menú se encarece. La sonda lo responde en
30 segundos antes de construir.
(Superado 27/08/2026: la sonda WP-209 está **muerta desde el 14/08** y no va a ejecutarse, y la
incógnita es irrelevante con el transporte B de WP-210 §2.2 — no hay pasos `Set` de modo que
verificar: el modo viaja como input del DC. El riesgo desaparece.)

## 7. Rollback

Backup `OnClick Mobility — BACKUP AAAAMMDD` antes de publicar.
