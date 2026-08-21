# PEGAR · el peldano 2 al OFRECER la llamada · 21/08/2026

**Workflow:** `beckham_bot` (`nhOwpiGxikeU5DLR`) · **Nodo:** `Decidir_Status`

## Como se pega

**El nodo ENTERO, con Cmd+A.** No por trozos: el 21/08 un parche entregado como
"busca esta linea y sustituye" acabo con una linea de prosa dentro del codigo y un
`SyntaxError`.

    pbcopy < docs/nodo-decidir-status-2026-08-21.js

Abre el nodo `Decidir_Status`, clic dentro del codigo, **Cmd+A**, **Cmd+V**, guarda y **publica**.

## Que cambia y por que

El peldano `2. Pendiente llamada TD` exigia `motivo_cierre='Llamada agendada'`, y ese motivo el
prompt solo lo manda si el cliente confirma **dos cosas mas**: que ya ha reservado en Calendly y
que no le queda ninguna duda. La cola del fiscal dependia de que el cliente contestase dos veces
mas despues de recibir el enlace.

**Medido el 21/08 en la conversacion `215475580835251`** (52.000 euros, caso al limite): el bot dio
el enlace en el turno 052, el cliente no contesto, y la fila `recaa78HP2dHKXCpH` se quedo en
`1. Interesado`. Un caso que necesita llamada **que el fiscal no ve**. `AplicaBeckham` no salva
esto: un caso complejo no lo marca nunca, a proposito (WP-238).

Ahora basta con que el caso **tenga senales de complejidad**: tener senales es, por definicion,
"hay que llamar". Llegan en la misma llamada que el salario, asi que **no hace falta ningun campo
nuevo** — y eso importa, porque un campo nuevo son cinco sitios.

El codigo nuevo son tres cosas: una funcion `leerMulti` (un multipleSelects de Airtable llega como
array de `{id,name,color}`, igual que los singleSelect), un `requiereLlamada`, y ese termino
sumado al `else if` del 2. Mas dos campos de traza, `_requiere_llamada` y `_senales`, para que un
2 inesperado se pueda depurar sin releer el codigo.

## EFECTO QUE HAY QUE CONOCER ANTES DE PEGAR

El 2 se escribe **en cuanto el cliente dice un salario al limite**, o sea a mitad de la
conversacion y no al final. **El fiscal vera en su cola casos todavia incompletos.** Es deliberado
y es la decision del usuario del 21/08: es mejor que ver de menos. La escalera sigue subiendo sola,
asi que un caso que luego se complete pasa al 3 sin que nadie tenga que bajarlo del 2.

## Comprobacion despues de pegar

1. `node docs/test-decidir-status.js` -> **28 verdes, 0 rojas**.
2. Publicar y comprobar por MCP que `versionId == activeVersionId`.
3. En una conversacion nueva, decir un salario de 52.000 y **mirar la fila SIN llegar al final**:
   `Status` tiene que estar ya en `2. Pendiente llamada TD`. En la traza de `Decidir_Status`,
   `_requiere_llamada: true` y `_senales` con la senal dentro.
4. Y la no regresion que importa: un expediente que se cierra completo tiene que seguir yendo
   al `3`, no quedarse en el 2. La puerta lo cubre, pero conviene verlo una vez en vivo.
