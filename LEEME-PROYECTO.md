# Proyecto Mobility · Beckham

Bot conversacional que cualifica candidatos a la **Ley Beckham** (régimen fiscal especial para
trabajadores desplazados a España), recoge su documentación y construye su expediente. Produce dos
entregables: un **informe de memoria fiscal en PDF** para el cliente y un **fichero `.030`
posicional** para que un fiscal lo suba a la sede de la AEAT.

**Tres sistemas:** Intercom (la conversación) → n8n (toda la lógica) → Airtable (el expediente y el
bus de eventos).

**Fecha de entrega: 31/08/2026.** Alcance completo, sin recortes.

---

## Por dónde empezar

| # | Lee esto | Por qué |
|---|---|---|
| 1 | **[`docs/arquitectura-completa-2026-08-16.md`](docs/arquitectura-completa-2026-08-16.md)** | Todo el sistema de punta a punta, con 5 diagramas y las 14 decisiones de arquitectura y su porqué |
| 2 | **[`.spartax/context.md`](.spartax/context.md)** | El resumen vivo: stack, IDs, convenciones, reglas, glosario |
| 3 | **[`plan/PLAN-31-08-2026.md`](plan/PLAN-31-08-2026.md)** | El plan maestro hasta la entrega |
| 4 | **[`docs/prds/fase2/map.html`](docs/prds/fase2/map.html)** | El mapa del backlog: fichas con estado y dependencias. Ábrelo en el navegador |
| 5 | **[`.spartax/log.md`](.spartax/log.md)** | La bitácora. **Aquí está el 80% del conocimiento real**, incluidos los fallos y por qué se decidió cada cosa |

---

## El hecho que hay que entender antes de tocar nada

**No hay código fuente versionado. El sistema *es* su configuración.**

La lógica vive dentro de nodos de n8n, de expresiones de n8n, de automatizaciones de Airtable y de
un prompt de ~47.000 caracteres alojado en LangSmith. Los `.json` de `referencia/exports-n8n/` son
**exportaciones, no fuente**: se generan después de publicar.

De ahí tres consecuencias que se notan a diario:

- No hay CI ni entorno local. Se publica y se audita después, por MCP, con diff.
- La verificación es **manual y por evidencia**: conversación real, `curl`, bytes del fichero.
- Un cambio mal hecho **falla en silencio**. La regla de casa es *campo nuevo = cuatro sitios*
  (la tool del agente, el validador, el mapeo de Airtable y el prompt), y olvidar uno **no da error**.

---

## Mapa del repositorio

```
├── README.md              ← estás aquí
├── .spartax/              ← LA BITÁCORA VIVA. log.md, state.json, context.md. No se toca a mano
├── docs/                  ← toda la documentación técnica viva y el código de los generadores
│   ├── prds/              ← las fichas de trabajo (WP-xx) y el mapa de dependencias
│   └── backup-automatizaciones-20260812/
├── plan/                  ← el plan maestro y el arranque del día
│   └── historico/         ← planes, reanudaciones y narrativas de sesión ya pasados
├── informes/              ← entregables de presentación y la auditoría externa
├── referencia/            ← material de apoyo: marca, exports de n8n, documentos de prueba
├── scripts/               ← pruebas de contrato y el push de cierre
├── _archivo/              ← lo obsoleto, conservado y con banner. Ver _archivo/LEEME.md
└── _externo/              ← proyectos ajenos a Beckham que vivían aquí dentro
```

### `docs/` es **plano a propósito**

No lo subdividas. Dos motivos, los dos duros:

1. `docs/montar-nodo-informe.sh` y `docs/montar-nodo-030.sh` hacen `cd "$(dirname "$0")"` y llaman a
   las piezas **por nombre pelado**. Si las piezas dejan de estar al lado del script, no compilan.
2. El repositorio remoto tiene `docs/` **aplanado en la raíz**, y esa es una decisión cerrada del
   5/08. `scripts/push-cierre.sh` depende de ello.

---

## Los dos generadores

Se montan a mano, byte a byte, porque en n8n no se pueden instalar librerías.

| | Informe de memoria fiscal | Fichero `.030` |
|---|---|---|
| Qué sale | PDF, ES/EN, 3 páginas, Times, logo | Texto posicional, 2700 bytes, **ISO-8859-1** |
| Se monta con | `bash docs/montar-nodo-informe.sh` | `bash docs/montar-nodo-030.sh` |
| Resultado | `docs/nodo-montar-informe-COMPLETO.js` | `docs/nodo-montar-030-COMPLETO.js` |
| Va pegado en | nodo `Montar el informe` de `beckham_informe_mobility` | nodo `Montar el .030` de `beckham_generar_030` |

**Se toca el fichero fuente, se vuelve a concatenar y se pega entero.** Nunca se edita en n8n.
El script **no regenera** el `COMPLETO` si alguna prueba está roja, y revierte al anterior si falla
la de integración.

**El recuento SIEMPRE en caracteres, no en bytes.** `wc -c` da bytes; el editor de n8n cuenta
caracteres, y con ~1.500 acentos los dos números se separan casi 3.000.

Las 14 pruebas se pasan de golpe con:

```bash
for t in docs/test-*.js docs/verificar-nodo-030.js; do node "$t" >/dev/null && echo "OK $t" || echo "FALLA $t"; done
```

---

## Publicar la documentación

```bash
./scripts/push-cierre.sh          # simulacro: enseña qué cambiaría, no sube nada
./scripts/push-cierre.sh --push   # sube de verdad
```

El directorio de trabajo **no es un repo de git**. El script clona
`Hammad-taxdown/docs-para-notion` en un temporal, copia a las rutas planas del remoto y commitea
desde el clon. Lleva una guardia que **aborta si detecta el CSV de empleados**, que tiene PII real
y no puede subir.

---

## Reglas de la casa

- Todo en **español**, incluidos los comentarios de código.
- Horas siempre en **hora de Madrid**, nunca UTC.
- Valores para pegar en n8n: **sin el `=` inicial y sin salto de línea final**.
- En nodos de código **nunca `$('X').item`, siempre `.first()`** — el `.item` cuelga el task runner.
  En **expresiones** la regla es la contraria: `.item` es el item emparejado y `.first()` devuelve
  siempre el primero.
- Bitácora: cada cambio con su prueba. **Un cambio, una prueba**: dos cambios y una sola prueba ⇒
  la prueba no cuenta.
- **«Diagnosticado» no es «resuelto».** Nada se cierra sin verificarlo.
- Workspace de Intercom **TEST**. Preview y Simulation no validan nada; **nunca escribir desde el Inbox**.

---

*Última reorganización del repositorio: 16/08/2026. Estructura anterior: 34 ficheros sueltos en la
raíz y un clon obsoleto del remoto.*
