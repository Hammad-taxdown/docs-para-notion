# Canvas desde CERO en producción · plan completo · 27/08/2026

Decisión del usuario (27/08, sexta vez que lo pide): **el canvas nuevo se construye desde cero**,
no se parchea el viejo. Leído de los 24 PRDs de fase 2, del mapa consolidado del 26/08 y del log.

**ASUNCIÓN DECLARADA: T081 = B pura** (la recomendada). El rebuild desde cero es el momento natural:
con B pura no existe `modo_bot`, no hay paso de reset (WP-212 muere), y la reentrada cae siempre al
menú (WP-227 pasa de M a S). Si el usuario elige B híbrida, se añade `modo_bot` + reset + TTL.

**Regla de despliegue (WP-233 + §5 del mapa):** hoy entran leads reales. Se DUPLICA el Custom Bot
(`OnClick Mobility — BACKUP AAAAMMDD`), el nuevo se monta EN LA COPIA, se prueba en incógnito con
`beckham-e2e@taxdown.es`, y el disparador se cambia AL FINAL. El canvas no se toca por API: todo clics.

---

## 1 · INTERCOM · qué se crea

### 1.1 · Custom Bot nuevo «OnClick Mobility v2» (el canvas entero)

```
A  Bienvenida
└─► AOPT · menú de 4 salidas (WP-213):
    [Comprobar si cumplo] [Calcular mi ahorro] [Tengo preguntas] [Hablar con una persona]
    («no creo que cumpla» NO va en el menú: vive dentro del FAQ, WP-215)

── RAMA SOLICITUD (modo=solicitud en CADA input de DC, WP-210 §2.2) ──
B  FILTRO F1 ¿residente fiscal 5 años? ── sí ─► D 🔴 DC punto=descarte_residencia · CLOSE
└─ no ─► E  FILTRO F3 ¿alta en la SS? ── no ─► H 🟡 DC punto=lead ANTES de preguntar nada
         │      (WP-224: lead_potencial=true, alta_ss=false, precision=desconocida;
         │       luego P/R enriquecen la MISMA fila; Q «no sé cuándo» guarda y no programa)
         │       modo=lead_potencial. Hilo ABIERTO.
         └─ sí ─► F  Collect data fecha ─► DC1 beckham_f2_plazo SÍNCRONO
                  └─► I  branch sobre veredicto_f2 (CON E, el atributo con i NO existe)
                       ├─ en_plazo    ─► G 🟢 DC punto=cualifica · NO cierra · handoff (WP-217)
                       ├─ fuera_plazo ─► N 🔴 DC punto=descarte_plazo · CLOSE  (directo, SIN M. Path)
                       ├─ fecha no parseable ─► repreguntar con intentos_fecha_bot
                       │    (<2 repregunta con ejemplo literal · ==2 escala)      (WP-216 B7)
                       └─ veredicto VACÍO ─► escalar SIN repreguntar (fallo de sistema)

── RAMA CALCULADORA (WP-214) ── mensaje con ENLACE (Intercom no redirige) + botones de vuelta
   al menú. modo=calculadora. Hilo ABIERTO, sin Close, no escribe expediente.

── RAMA FAQ (WP-221, etapa 1: UN turno) ── Collect data pregunta libre ─► DC punto=faq_entrada,
   modo=faq_regimen, wait_for_callback ─► respuesta del nodo FAQ ─► botones WDONE:
   [otra pregunta] [ya está, quiero empezar] [hablar con una persona]
   faq_turnos_bot++ por turno; >=3 ─► oferta humano/solicitud y NO se responde más.
   Autodescarte (WP-215): desde el FAQ, DC punto=autodescarte_declarado (NUNCA Descarte),
   mensaje + botones FAQ/calculadora/menú, hilo ABIERTO.

── RAMA HUMANO (WP-223) ── path L ÚNICO con una sola redacción, alcanzable desde menú, FAQ,
   calculadora y todas las ramas de error. Asigna DE VERDAD a Ops_Mobility. SLA 24-48 h (M6
   decidido 26/08). modo=humano.

INVARIANTES DEL CANVAS ENTERO:
· Close conversation SOLO en D y N. NINGUNA rama toca ticket.state.
· NO existen: M. Path, SAVE, FLAG, RESUME→B, K→FRETRY→M (WP-216: no se reconstruyen).
· CADA llamada a DC lleva `modo` como input obligatorio (transporte B). Tabla de cobertura
  de WP-210 §2.2 = entregable firmado: un punto sin modo = fail-closed = usuario sin respuesta.
· El modo NUNCA va en el body del webhook público: solo como input del DC.
```

### 1.2 · Handoff en frío de G (WP-217)
Inputs de «último mensaje» del DC a **Optional** (con paso Number→Text donde el tipo lo impida);
si Intercom no deja Optional: **DC dedicado de arranque en frío** con contrato propio.
Asignar al **team del bot**, no a Ops. G/GEND **no cierra**.

### 1.3 · Workflow de Intercom NUEVO #2: trigger `Reopened` (WP-227, versión B pura)
Hoy NO existe ninguno con ese trigger. Reentrada **siempre al menú**. El enlace de recordatorio va
**siempre al launcher**, nunca reabre el hilo viejo, nunca toca ticket.state. Matriz e2e: hilo
abierto · cerrado · dentro del cooldown de 2 min · vuelta a los 3 días.

### 1.4 · Conversation attributes (Text) — crear/verificar
CREAR: `corte_contexto_bot` · `faq_resumen_bot` · `faq_turnos_bot` · `intentos_fecha_bot` ·
`corr_id_bot` (los 5 contadores/acarreos de WP-210 §2.3).
NO CREAR: `modo_bot` (B pura).
VERIFICAR que existen: `veredicto_f2` · `fecha_limite_f2` · `dias_pasados_f2`.

### 1.5 · Data Connectors
Los DC existentes (escritor + f2_plazo) se reutilizan, PERO cada llamada añade el input `modo`.
NUEVOS: el DC del FAQ (`punto=faq_entrada`, wait_for_callback) y, si Optional no vale, el DC de
arranque en frío de G. Timeout duro de 15 s: responder 200 ya y publicar por callback.

---

## 2 · N8N · qué se crea / cambia

| # | Pieza | WP | Nueva o cambio |
|---|---|---|---|
| 1 | **Pegar el escritor COMPLETO** (corr_id + Log_Evento, 76.156 car) | 207/208 | PRIMERO: paso 4 de pasos.sh, ya montado |
| 2 | **`BECKHAM_upsert_expediente`** subworkflow: workflowInputs (user_id, conversation_id, punto, modo, corr_id, idem_key + campos), enum `resultado` + `dropped[]`, whitelist punto **y** modo (400 ante desconocido), errorWorkflow, description. El webhook público DELEGA en él: un solo escritor. Los nodos viejos quedan `disabled`, no borrados | 207+219 | **NUEVO workflow** |
| 3 | **`Resolver_Modo`**: deriva el modo server-side, fail-closed en memoria → `faq_regimen` + evento `modo_ausente` al errorWorkflow con contador; **dedupe por conversation_part_id** (sustituye el debounce If2/Wait2 — y ahí muere el Wait fijo de 3 s, no antes); cold_start deja de ser `!last_message_content` | 211 | NUEVO nodo/subworkflow en beckham_bot |
| 4 | **Dos nodos AI Agent** (FAQ y Solicitud) con `prompt_base` en UN nodo Set, mismo sub-nodo de modelo (David Beckham), IF de routing sobre la salida del resolver, `maxIterations` explícito en los dos, systemMessage como expresión en los dos | 218 | Cambio en beckham_bot |
| 5 | **Tools como `Call n8n Workflow Tool`** (nunca HTTP al propio webhook): nodo FAQ = solo `escalar_humano(motivo)` + `registrar_optout()` · nodo Solicitud = las de intake + guarda de modo en el PRIMER nodo de cada tool de escritura (`modo_no_permitido`), inputs por defineBelow, JAMÁS $fromAI | 219+223 | NUEVAS tools |
| 6 | `escalar_humano`: asignación REAL a Ops_Mobility + traza corr_id. `registrar_optout`: toca SOLO `recordatorio_optout`. Corregir `Mensaje_fallback` (hoy promete y no asigna) | 223 | NUEVO + fix |
| 7 | **Corte de contexto + PII**: al salir de FAQ fijar `corte_contexto_bot` + `faq_resumen_bot` (≤400); `Formatear_conversacion1` descarta parts previas al corte; `Preparar_Prompt` enmascara NIE/DNI, IBAN, teléfono, email en modo FAQ | 222 | Cambio en 2 nodos code |
| 8 | **Semántica de reset por punto**: tabla punto×campo (escribe · borra a propósito · no toca) implementada en el escritor; medir ANTES la incógnita 8 (¿undefined pisa?) con curls sobre fila precargada | 226 | Cambio en el escritor |
| 9 | Prompt: conocimiento fiscal inline YA está (v13/v14); regla dura «si no está aquí, no lo sé» + 30 preguntas doradas | 220 | building, verificar |
| 10 | **Observabilidad**: 5 alertas sobre Notificaciones_error (fallo escritura, multi_match, modo_ausente, callback expirado, scheduler), desactivar guardado de datos de ejecuciones exitosas, returnIntermediateSteps NO | 231 | Config + alertas |

BLOQUEADOS (no se construyen ahora): WP-228 FAQ multiturno (por WP-10: los tickets no disparan
triggers de mensaje) · WP-229 FAQ→solicitud (incógnita Pass to) · WP-230 recordatorios (M1/M2/M3).

---

## 3 · AIRTABLE · campos y vistas nuevos (ninguna tabla nueva)

| Qué | Campos | WP |
|---|---|---|
| Precisión de fecha del lead | `precision_fecha_prevista` (exacta·mes·trimestre·rango·desconocida) · `fecha_prevista_desde` · `fecha_prevista_hasta` · `fecha_prevista_texto` | 224 |
| Consentimiento | `recordatorio_optin` · `recordatorio_optin_fecha` · `recordatorio_optin_corr_id` · `recordatorio_optout` · `recordatorio_intentos` · `recordatorio_ultimo_envio` | 225 |
| Vistas | `Leads potenciales` (lead=true AND Descarte vacío AND optout=false) · `leads sin fecha` · `leads agotados` | 225 |

⚠️ Campo nuevo = CINCO sitios + EL SEXTO: refrescar el schema cacheado de `Airtable Upser
Expediente` en la UI, comprobando después contra `docs/upser-campos-mapeados-2026-08-26.txt`
que no se reactivó ninguno de los 36 quitados.

---

## 4 · ORDEN DE CONSTRUCCIÓN

```
FASE 0 · hoy, antes de nada
  0.1  Pegar el escritor COMPLETO (pasos.sh 4) ── desbloquea TODO el lado n8n
  0.2  Prompt v14 + tag prod (pasos.sh 1)
  0.3  Duplicar el Custom Bot ── BACKUP AAAAMMDD (el rebuild sustituye al paso 2 viejo:
       las correcciones de WP-216 ya van DENTRO del canvas nuevo, no se parchea el viejo)

FASE 1 · n8n (yo preparo, tú pegas/creas)          FASE 1' · Intercom EN LA COPIA (paralelo)
  1.1  WP-207 subworkflow escritor                    1.1' atributos nuevos (los 5 Text)
  1.2  WP-211 Resolver_Modo + dedupe                  1.2' esqueleto A→AOPT→4 ramas
  1.3  WP-218 dos agentes + IF                        1.3' rama solicitud completa (B,E,F,I,D,N,H,G)
  1.4  WP-219/223 tools + guardas                     1.4' calculadora · FAQ · humano · autodescarte
  1.5  WP-222 corte + PII                             1.5' WP-217 handoff frío de G
  1.6  WP-226 semántica por punto                     1.6' workflow trigger Reopened (WP-227 S)

FASE 2 · WP-224/225 campos Airtable + registro del lead en H + vistas + contrato
FASE 3 · WP-231 alertas y PII fuera de logs
FASE 4 · WP-233 · e2e: 4 recorridos del menú + 4 reentradas + recorridos de dato, cada uno con
         su par (conversation_id no-Preview, execution_id) ── y SOLO entonces cambiar el
         disparador al bot nuevo. contract-test.sh verde. Cero correos al contacto e2e.
```

Camino crítico (peso 21): WP-207 → 208 → 211 → 218 → 219+220 → 221 → 222 → (228 bloqueado) — la
cadena del FAQ, no el menú. El canvas (fase 1') NO está en el camino crítico: se monta en paralelo.

## 5 · Decisiones abiertas que muerden texto publicable
· **U3**: sin `user_id` el escritor da 400 y el lead se pierde (agujero de WP-224 por arriba).
· **U4**: confirmar que el autodescarte no es terminal (WP-215 lo da por aprobado pendiente de ti).
· T081 formalmente: este plan ASUME B pura; si eliges híbrida, vuelven modo_bot + reset + TTL.
