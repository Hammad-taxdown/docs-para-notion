# Hoja de pegado · la escalera de Status · 19/08/2026

La escalera pasa a significar lo que dice el nombre de cada peldaño:

| Peldaño | Quién lo escribe | Cuándo |
|---|---|---|
| **3. Pte hacer informe** | **el bot**, en `Decidir_Status` | `MotivoCierre='Expediente completo'` |
| **4. Informe enviado** | **`beckham_informe_mobility`**, en `Marcar InformeListo` | cuando el PDF ya está subido a la fila |

Son **cinco sitios**. Van en **este orden**, y el orden importa: si se pega primero
`Decidir_Status` y todavía no están los filtros, una fila que cierre se queda clavada en el 3 y no
la recoge nadie.

> **Antes de empezar, comprobado con datos:** con los filtros nuevos **no se dispara nada**. En la
> tabla hay 4 filas: dos en el 1, una en el 7 y `recp0TwCJ7RPzhwbA` en el 4 — y esa ya tiene
> `InformePdf` (33.770 B) y `Fichero030` (2.700 B), con `RegenerarInforme` y `Regenerar030` vacíos,
> así que la segunda mitad del filtro (`OR(Regenerar=1, adjunto=BLANK())`) le sale falsa. Ninguna
> fila en el 3. **Los filtros nuevos casan con 0 filas al pegarlos.**

---

## 1 · `beckham_informe_mobility` → nodo «Buscar filas pendientes»

Campo **Filter By Formula**. Sin el `=` inicial y sin salto de línea final:

```
AND(OR({Status}="3. Pte hacer informe",{Status}="4. Informe enviado"), OR({RegenerarInforme}=1, {InformePdf}=BLANK()))
```

Antes era `AND({Status}="4. Informe enviado", OR({RegenerarInforme}=1, {InformePdf}=BLANK()))`.

## 2 · `beckham_generar_030` → nodo «Buscar filas pendientes»

```
AND(OR({Status}="3. Pte hacer informe",{Status}="4. Informe enviado"), OR({Regenerar030}=1, {Fichero030}=BLANK()))
```

Antes era `AND({Status}="4. Informe enviado", OR({Regenerar030}=1, {Fichero030}=BLANK()))`.

**Por qué los dos peldaños y no solo el 3:** los dos schedule disparan cada 15 minutos con 18
segundos de diferencia (el `.030` en el `:23` y el informe en el `:41`). Si filtrasen solo el 3, el
informe escribiría el 4 y **un `.030` que hubiera fallado no reintentaría jamás**. Con los dos
peldaños el orden deja de importar y `Regenerar030` / `RegenerarInforme` siguen funcionando igual.

## 3 · `beckham_informe_mobility` → nodo «Marcar InformeListo»

Añadir **un campo más** a los cuatro que ya escribe (`InformeListo`, `RegenerarInforme`,
`ErrorInforme`, `InformeEnviadoEl`):

| Campo | Valor |
|---|---|
| `Status` | `4. Informe enviado` |

Valor literal, sin `=`. El nodo lleva `typecast: true`, así que **la grafía tiene que ser exacta**:
con una letra distinta no falla, **crea una opción nueva** en la columna. Es `4. Informe enviado`,
con el punto y un solo espacio.

**Esto no puede hacer retroceder el Status, y la razón es el filtro del punto 1:** una fila en el 7
no entra nunca en este workflow, porque el filtro solo admite el 3 y el 4. Si algún día alguien
amplía ese filtro, este nodo empieza a poder bajar el peldaño. Los dos cambios van atados.

## 4 · Airtable → automatización «3b. Envio borradores 030 y 149 sin script»

`wflbayW4R4IvjHLTQ`. Hay que quitar **«3. Pte hacer informe»** de la condición
**«Status del 1 al 6 o vacío»** — y está **DUPLICADA**, una copia dentro de la rama *Inglés* y otra
dentro de la rama *Español y cualquier otro idioma*. Hay que tocar **las dos**.

Se deja el 1, el 2, el **4**, el 5, el 6 y el «is empty». **El 4 se queda**: es el paso normal
4 → 7 cuando ya existe el informe.

**Por qué:** esto es lo que se comió el informe del 18/08. La fila `recIvWrCD6PcsE10p` llegó al
peldaño 4 a las 11:02:25, el `.030` se generó a mano a las 11:02:50, y el tick del informe de las
11:15:41 ya no encontró la fila — `EnviarBorradores` la había subido al 7 y la había sacado de la
ventana. Con el 3 dentro de esa condición volvería a pasar exactamente igual, solo un peldaño antes.

> Ojo: el `id` de la opción es `selc7DwpMePvALjtj`. Los que se quedan son `sel8DiQPH9ZzaSueO` (1),
> `sely8bsw13KtPCkgR` (2), `seloL0ipNAsEQ4i80` (4), `seljanPKqhwUObbwc` (5), `selJZorqcDy6YgFiF` (6)
> y el `isEmpty`.

## 5 · `beckham_bot` → nodo `Decidir_Status`

Pegar **entero** el contenido de `docs/nodo-decidir-status-2026-08-19.js`.

- **8.977 caracteres** (el editor de n8n cuenta caracteres, no bytes)
- 182 líneas
- El anterior está respaldado en `docs/BACKUP-decidir-status-v-antes-del-19-08.js` (8.082 caracteres)

Lo único que cambia de comportamiento es una línea: `propuesto = '4. Informe enviado'` pasa a
`propuesto = '3. Pte hacer informe'`. El resto del añadido son comentarios que explican el reparto
de los dos peldaños y los cinco sitios, para que no se vuelva a deshacer.

**Puerta de pruebas:** `node docs/test-decidir-status.js` → **15 verdes, 0 rojas**. Cubre los cuatro
casos de no-regresión (ya en el 3, ya en el 4, ya en el 7, y el descarte con el equipo trabajando),
las dos formas en que Airtable devuelve un `singleSelect`, la lectura fallida, el `UserId`
duplicado, y que el nodo **no asigne el peldaño 4 por ningún camino**.

---

## Después de pegar: cómo se comprueba que funciona de verdad

Lo que **nunca** se ha visto es un tick de 15 minutos produciendo algo: las 5 generaciones que
existen son `mode=manual` lanzadas desde la UI. La prueba de verdad es esta, y no vale hacerla a
mano:

1. Cerrar una conversación con «expediente completo» → la fila debe quedar en **3**.
2. **No tocar nada más.** Esperar al tick.
3. En ≤15 min: `Fichero030` con un `.030` de 2.700 bytes, `InformePdf` con el PDF, `InformeListo`
   marcado y el `Status` **en 4**.
4. Y comprobar en n8n que las dos ejecuciones son `mode=trigger`, no `manual`.

Si el paso 3 no pasa, el sitio donde mirar es el `Status` de la fila en ese momento: si algo lo ha
movido del 3, es otro escritor y hay que encontrarlo.
