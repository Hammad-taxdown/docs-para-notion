# `_archivo/` — lo que ya no rige, conservado a propósito

Nada de lo que hay aquí describe el sistema tal y como está hoy. Se conserva porque documenta
**cómo se llegó** a las decisiones actuales, que es información que no está en ningún otro sitio.

**Si buscas el estado actual, no mires aquí.** Mira `README.md` en la raíz.

Cada `.md` de esta carpeta lleva un banner en la primera línea que dice de qué fecha es y qué
documento lo sustituye.

| Qué | De cuándo | Lo sustituye |
|---|---|---|
| `ARQUITECTURA_bloque1.md` | 20/07/2026 | `docs/arquitectura-completa-2026-08-16.md` |
| `contexto_proyecto_beckham.md` | 20/07/2026 | `.spartax/context.md` |
| `RUNBOOK-2026-07-30.md` | 30/07/2026 | `docs/arquitectura-completa-2026-08-16.md` §10 |
| `update_notion.md` | 22/07/2026 | `scripts/push-cierre.sh` |
| `mvp_beckham/` | 20/07/2026 | Maqueta HTML del MVP. Nunca llegó a producción. |
| `map-html-bak/` | 01–14/08/2026 | Los 9 backups de `docs/prds/fase2/map.html`. El vigente sigue en su sitio. |
| `backups-spartax-20260801/` | 01/08/2026 | Copia del `log.md` y el `state.json` de aquel día. La bitácora viva es `.spartax/`. |
| `orchestron-restos/` | julio 2026 | Restos de `.orchestron`, una herramienta que se dejó de usar. |

## Antes de borrar nada de aquí

El directorio de trabajo **no es un repositorio de git**: lo que se borra aquí no se recupera.
Lo que sí está respaldado en GitHub (`Hammad-taxdown/docs-para-notion`) es todo lo que sube
`scripts/push-cierre.sh`.
