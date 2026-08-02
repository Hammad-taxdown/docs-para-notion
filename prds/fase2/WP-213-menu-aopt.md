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

> DECISIÓN APROBADA: `A. Bienvenida` → **reset de `modo_bot`** → `AOPT` con `Comprobar si cumplo` ·
> `Calcular mi ahorro` · `Tengo preguntas` **+ `Hablar con una persona`**. La opción
> "no creo que cumpla" **se retira del menú** (cerrar por una autoevaluación sin datos quema un lead)
> y se ofrece dentro del FAQ.
> DESCONOCIDO: el máximo real de reply buttons por paso. **No se citan cifras sin fuente**; si 4 no
> caben, se prioriza en ese orden. INVARIANTE incómoda declarada: **el menú no es un punto de entrada
> garantizado** (HECHO VERIFICADO: el Messenger reanuda el hilo abierto).

## 1. Objetivo

Cuatro salidas del menú que lleven al destino correcto y escriban la transición de entrada del modo,
sin que ninguna toque `ticket.state`.

## 2. Alcance

**In:**
- `AOPT` con los 3 botones + humano.
- Un paso `Set modo_bot` por rama: `solicitud` · `calculadora` · `faq_regimen` · `humano`.
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

1. `AOPT` publicado con las cuatro salidas y sus pasos `Set`.
2. Prueba visual del número de botones que caben (cierra la incógnita 9).

## 5. Verificación

- Matriz de **4 recorridos** en conversación no-Preview, cada uno con su par
  (`conversation_id`, `execution_id`): la rama pulsada coincide con el `modo_bot` leído después por
  `get_conversation`.
- En los 4 recorridos, `ticket` sigue siendo el mismo valor que al nacer la conversación: **ninguna
  rama cambia `ticket.state`**.
- Captura anotada del menú en móvil y en escritorio.

## 6. Riesgo

Medio: si `Set` no admite literales (incógnita 2, con **contradicción documental** entre el briefing y
`.spartax/log.md`), cada rama necesita un paso previo y el menú se encarece. La sonda lo responde en
30 segundos antes de construir.

## 7. Rollback

Backup `OnClick Mobility — BACKUP AAAAMMDD` antes de publicar.
