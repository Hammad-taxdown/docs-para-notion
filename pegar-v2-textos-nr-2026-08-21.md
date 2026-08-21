# HECHO Y VERIFICADO · los textos de no residente solo cuando aplican · 21/08/2026

**Workflow:** `beckham_informe_mobility_v2` (`snoDqB063jMSgzUq`) · **Nodo:** `Preparar el informe`

> **NO PEGUES NADA DE ESTE FICHERO.** El cambio ya esta dentro del nodo, verificado en la
> ejecucion **8128159** del 21/08/2026 (11:10 de Madrid). Queda como registro del que y del porque.
> Si hay que volver a pegar el nodo, el codigo entero esta en
> **`docs/nodo-v2-preparar-informe-2026-08-21.js`** y se pega con **Cmd+A**, no por trozos.

## Que se arreglo

Los cuatro marcadores de no residente se calculaban SIEMPRE, tambien cuando el año 0 era Beckham
o Residente Fiscal, porque `esUE` se decide solo con `sit0 === "No residente UE"` y todo lo demas
caia en la rama del 24 %. Medido en vivo en la ejecucion **8127865**, fila `recp0TwCJ7RPzhwbA`,
clave `BCK+BCK|ES`:

    m_TipoNR      = "24 %"
    m_NotaTipoNR  = "Alemania esta fuera de la Union Europea. Sobre el bruto, sin deducir gastos."

Alemania esta DENTRO de la Union Europea, y el caso no era de no residente: la frase era falsa dos
veces. No se imprimia porque las plantillas `BCK+BCK` y `RF+RF` no llevan esos marcadores, pero un
marcador copiado de una plantilla a otra le manda una falsedad fiscal a un cliente que la guarda.

## El arreglo

Una linea nueva junto a `esUE`:

    const esNR = (b0 === "NRF");

y los cuatro marcadores del `return` con guarda:

    m_TipoNR: esNR ? F.tipo : "",
    m_NotaTipoNR: esNR ? F.nota : "",
    m_FraseTipoNR: esNR ? F.frase : "",
    m_FraseAlquilerNR: esNR ? F.alquiler : ""

Si el año 0 no es no residente, los cuatro salen VACIOS: un hueco sin rellenar se ve, una frase
falsa no.

## Verificado (ejecucion 8128159, dos filas a la vez)

| dato | recIvWrCD6PcsE10p | recp0TwCJ7RPzhwbA |
|---|---|---|
| clave | `BCK+BCK|ES` | `BCK+BCK|ES` |
| `m_TipoNR` · `m_NotaTipoNR` · `m_FraseTipoNR` · `m_FraseAlquilerNR` | los cuatro `""` | los cuatro `""` |
| `m_UltimoPais` | Marruecos | Alemania |
| `m_SalarioBruto` | 80.000 | 66.000 |
| años 0/1/fin/720 | 2026 · 2027 · 2031 · 2027 | 2026 · 2027 · 2031 · 2027 |

Sigue muriendo en `Copiar la plantilla` por la credencial de Google sin autorizar, que es el
resultado esperado hoy.

## LO QUE FALTA DE ESTA PRUEBA

La contraprueba negativa: un caso **NRF** (`NRF+BCK` o `NRF+RF`) tiene que seguir trayendo los
cuatro textos CON su pais. Ahora mismo no hay ninguna fila asi. Se hace cuando exista, o
fabricando una con `fechaDesplazamiento` posterior al 1 de julio.

## La leccion del pegado

La primera version de este fichero decia "busca esta linea y sustituye por estas otras". Se pego
tambien la linea de prosa "Cambio 2 - las cuatro ultimas lineas del return:" DENTRO del codigo, y
las cuatro lineas nuevas quedaron en medio del fichero con el `return` de abajo sin tocar:
`SyntaxError: Unexpected number` (ejecucion 8128061). **Cuando un cambio toca dos sitios de un
nodo de codigo, se entrega el NODO ENTERO.**
