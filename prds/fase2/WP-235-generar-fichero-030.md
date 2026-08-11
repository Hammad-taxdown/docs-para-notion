---
id: WP-235
title: "Generar el fichero .030 desde plantilla (NO es un PDF, es texto posicional)"
status: specified
size: M
depends_on: [WP-234]
milestone: "Fase 2 conversacional — Expediente y documentos"
owner: "Hammad"
external: "Fiscal (segunda muestra .030)"
critical: true
issue: ""
---

# PRD · WP-235 — Generar el fichero .030 desde plantilla (NO es un PDF, es texto posicional)

> **REESCRITO ENTERO EL 11/08, dos veces el mismo día.** Nació como «rellenar los modelos 030 y 149»,
> se recortó al 030 por la mañana y por la tarde **cambió de naturaleza**: el entregable no era un PDF.

## 1. El circuito completo, dicho por el usuario
1. El **agente** lee el expediente de Airtable.
2. Monta el fichero `<NIF>.030` sobre una **plantilla de posiciones**.
3. Lo deja **adjunto en la propia fila**. — *aquí acaba el bot* —
4. El **fiscal** lo sube a la sede de la AEAT.
5. **La AEAT genera el PDF.**
6. El fiscal completa el PDF y lo mete a mano en `Borrador030` y `Borrador149`.
7. Marca `EnviarBorradores` → sale el correo (**`WP-237`, ya existe**).
8. El cliente confirma.
9. El **fiscal presenta a mano**.

**El bot no toca la AEAT y no presenta nada.**

## 2. Dos enfoques descartados — no reintentar
- **Rellenar un PDF.** Los dos PDF del modelo (el borrador de producción y el vacío) son **renders
  planos**: cero `AcroForm`, cero `XFA`, cero `/Widget`, cero `/FT`. No hay campos y nunca los hubo.
- **Generar un PDF propio.** Innecesario: lo genera Hacienda.

## 3. El formato
**No es XML** aunque lo parezca por las etiquetas. Es el **posicional de ancho fijo** de la AEAT:
`<T030010>` (1481 caracteres) + `<T030020>` (1181), sin saltos de línea, 2.700 bytes.
Contrato decodificado en **`contrato-fichero-030-2026-08-11.md`**.

Se monta con una plantilla de posiciones: **ni una librería de PDF**.

## 4. Constantes
Las tres causas de presentación son fijas: **casillas 107, 103 y 105**, posiciones 160, 162 y 164.
Hay una **cuarta marca en la 172 sin identificar** (hipótesis: 201, residente fiscal).

## 5. El coste real: tablas de conversión, no columnas
El fichero quiere **códigos** y Airtable guarda **nombres**: ISO-2 para nacionalidad y país de
nacimiento (245 opciones × 3 listas), sexo a `V`, tipo de vía con código, y el **código INE de
municipio** (más de 8.000, se bajan del INE).

## 6. Huecos
- **208/209 primer y segundo apellido** contra una sola columna `Apellidos empleado`. Es el defecto
  que el correo de la automatización le cuenta hoy al cliente como «incidencia de la AEAT».
- **424 municipio de residencia** y su código INE: no está en ninguna columna.
- **No hacen falta:** el cónyuge (apartado 3, decisión del usuario), el teléfono partido (no está en el
  fichero) y la **provincia** — son los dos primeros dígitos del código postal.

## 7. Casilla 217
Residente fiscal si se desplaza **antes del 1 de julio** (183 días); si se desplaza después entra en el
ejercicio siguiente y la casilla vale `0101`+(año+1). **Esa lógica YA está escrita** en la fórmula
`Situación fiscal Anio Desplazamiento`: reutilizarla, no duplicarla.

## 8. Bloqueo
Falta una **segunda muestra `.030`** con datos distintos, mejor de alguien con **dos apellidos** y de
otra provincia. Con una sola no se distingue el borde de un campo del relleno de espacios: los anchos
de apellidos y nombre son **inferencia**.

## 9. Verificación
Un caso de prueba genera el `.030` adjunto en su fila y **la sede de la AEAT lo acepta** y devuelve el
PDF. La aceptación de la AEAT es la única prueba que vale.
