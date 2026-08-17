---
id: WP-239
title: "ResumenBot = ficha + prosa (el formato ya existe, la tool pedía lo contrario)"
status: done
size: S
depends_on: []
milestone: "Fase 2 conversacional — Expediente y documentos"
owner: "Hammad"
external: ""
critical: false
issue: ""
---

# PRD · WP-239 — ResumenBot = ficha + prosa (el formato ya existe, la tool pedía lo contrario)

> **PUBLICADO EL 11/08 Y SIN VERIFICAR EN CONVERSACIÓN**, por decisión del usuario.

## 1. Lo que se pedía
Que `ResumenBot` lleve **primero la ficha** con etiquetas fijas y **después** el resumen en prosa. Hoy
solo guardaba la prosa.

## 2. El hallazgo que cambió la ficha
El formato **ya estaba escrito en el prompt vivo**, líneas 58-83, con sus 18 etiquetas exactas
(`RESUMEN DE TU SOLICITUD`: Nombre · Fecha de nacimiento · Sexo · Teléfono · NIF/NIE/Pasaporte ·
Nacionalidad · País de nacimiento · Municipio y provincia · Último país de residencia · Domicilio ·
Fecha de llegada · Fecha de alta en SS · Salario · Motivo del desplazamiento · Estado civil · Hijos ·
Inmuebles · Inversiones, más *Idioma de atención*). **No había que inventarlo.**

El problema estaba **en otro sitio**: la descripción del parámetro `resumen` de la tool
`guardar_datos_cliente` pedía explícitamente lo contrario — *«redactado por ti y con tus palabras»*. El
agente obedece a la tool, no al bloque de formato, porque ese bloque es para **enseñarlo en pantalla**
y pedir confirmación, no para guardarlo.

**Es el cuarto caso del mismo patrón** (nacionalidad, cónyuge, discrepancia, resumen): el camino existe
y nadie lo usa.

## 3. El cambio
Reescrita la descripción del parámetro `resumen` (**33 de 36**) para que mande **ficha + línea en
blanco + prosa**. **No toca prompt, ni validador, ni mapeo:** la columna existe y ya se llena.

## 4. Engancha con WP-236
Esa misma descripción dice que *«este texto se reutiliza como base del informe fiscal»*. **Si la ficha
y los marcadores del informe divergen, habrá dos verdades.**

## 5. Erratilla detectada de paso
La línea 262 del prompt manda usar «el formato de la sección **FORMATO DE RESPUESTA**», pero la sección
se llama **FORMATO DE RESUMEN**. Arreglar en el mismo viaje.

## 6. Verificación pendiente
Una conversación completa deja en `ResumenBot` la ficha con las 18 etiquetas y, debajo, el párrafo.
Comprobado **en la celda**.
