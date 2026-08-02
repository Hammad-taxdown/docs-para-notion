---
id: WP-224
title: "Registro del lead en H con punto=lead, precisión de fecha, ventana y texto literal"
status: specified
size: M
depends_on: [WP-207, WP-216]
milestone: "Fase 2 conversacional — Leads"
owner: "Hammad"
external: ""
critical: true
issue: ""
---

# PRD · WP-224 — Registro del lead en `H`

> OMISIÓN DEL FLUJO PROPUESTO corregida: `H` **no persiste nada** hoy, así que quien abandona en `P` o
> en `R` **desaparece sin traza**. HECHO VERIFICADO: ya existe `recSop5rTn99Qft0o` con
> `lead_potencial=true` y **sin `UserId`**, irrecuperable por la clave de upsert.
> DECISIÓN APROBADA: el lead se persiste **en `H`**, antes de preguntar la fecha, y se enriquece
> después. `SAVE` se borra (WP-216).
> DECISIÓN APROBADA sobre la fecha: **una sola fecha no basta** y los campos `date` de Airtable son
> **date-only** (HECHO VERIFICADO) → "en marzo" se convertiría en "1 de marzo" y el mensaje mentiría.
> Modelo: **ancla + precisión + ventana + texto literal**. Se rechaza el valor "aproximada" por
> ambiguo.

## 1. Objetivo

Que todo usuario que llega a `H` quede registrado con `lead_potencial=true` y una precisión de fecha no
vacía, antes de que pueda abandonar.

## 2. Alcance

**In:**
- Llamada al escritor único con `punto=lead` **en `H`**: `lead_potencial=true`, `alta_ss=false`,
  `precision_fecha_prevista=desconocida`.
- Enriquecimiento posterior en `P`/`R` con la misma fila y el mismo `punto`.
- Campos nuevos en `Empleados` (**ninguna tabla nueva**): `precision_fecha_prevista`
  (`exacta|mes|trimestre|rango|desconocida`), `fecha_prevista_desde`, `fecha_prevista_hasta`,
  `fecha_prevista_texto`. `fecha_prevista_alta` se mantiene como **ancla representativa** para no
  romper WP-03/WP-05.
- Normalización: `exacta` → desde=hasta=ancla · `mes` → día 1 a fin de mes · `trimestre`/`rango` →
  explícitos · `desconocida` → las tres fechas vacías.
- Granularidad **diaria**, declarada como límite del esquema.

**Out:**
- Opt-in y vista → WP-225. Envíos → WP-230.
- Identidad de reserva cuando no hay `user_id`: **decisión abierta U3** — hoy sin `user_id` el webhook
  devuelve 400 y **no hay lead**.

## 3. Dependencias

WP-207 (escritor extraído y saneado), WP-216 (`SAVE` borrado).

## 4. Entregables

1. Los 4 campos de precisión creados en `Empleados`.
2. `punto=lead` llamado en `H` y en el enriquecimiento.
3. Curl de `punto=lead` en `contract-test.sh`.

## 5. Verificación

- Recorrido no-Preview que llega a `H` y **abandona** antes de responder la fecha: existe fila con
  `lead_potencial=true` y `precision_fecha_prevista=desconocida`. Este es el caso que hoy se pierde.
- Recorrido que responde "en marzo": `precision=mes`, `desde`=1 de marzo, `hasta`=fin de marzo,
  `fecha_prevista_texto`="en marzo", ancla coherente.
- Recuento: recorridos por `H` = filas creadas, cruzado por `corr_id`.
- La rama `Q` (no sabe cuándo) **guarda el lead** y no programa nada.

## 6. Riesgo

Medio: una escritura parcial puede **pisar** datos de otra rama (el `undefined` de un campo no mapeado
está avalado solo por curl, no por diseño → **hasta medirlo se trata como que sí pisa**). Mitigación:
semántica de reset por `punto` (WP-226) y matriz de curls con diff campo a campo.

## 7. Rollback

Los campos nuevos se pueden dejar sin uso; la llamada en `H` se retira del canvas con backup previo.
