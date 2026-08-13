# Corpus fiscal — Ley Beckham (régimen especial de trabajadores desplazados a territorio español)

## Procedencia y alcance

- **Fichero de origen:** `IRPF_TaxDown2025 (1).pdf` (352 páginas), manual interno de IRPF de TaxDown 2025.
- **Rango de páginas del bloque principal:** **309 a 317** (la sección titulada «Ley Beckham» arranca al final de la página 309 y termina en la página 317; la página 318 ya abre el capítulo «Paraísos Fiscales»).
- **Páginas adicionales incorporadas por tratar de impatriados:** 12 (regímenes especiales del IRPF), 245 (encuadre del régimen dentro de los regímenes especiales), 273 (tabla de consultas vinculantes, fila sobre reinversión en vivienda bajo régimen de impatriados), 330 (art. 5 TRLIRNR), 343 (árbol de decisión Modelo 151 vs. Modelo 100) y 345 (nota interna sobre Modelo 720).
- **Fecha de extracción:** 13 de agosto de 2026.
- **Herramienta:** `pdftotext -f/-l` sobre el PDF original; limpieza manual de numeración de páginas, encabezados y cortes de maquetación.

**Contenido excluido deliberadamente:** el resto del manual (deducciones familiares, paraísos fiscales/Gibraltar, recargos y sanciones, Modelo 720 en detalle, No Residentes generales, Modelo 210, atribución de rentas, etc.) no trata del régimen de impatriados y se ha dejado fuera. En particular se ha excluido la escala general de tipos del IRNR de la página 337 (tipo general 24%, residentes UE/EEE 19%) por referirse al IRNR de no residentes puros, no al régimen del art. 93 LIRPF.

**Fidelidad:** no se ha añadido, completado ni parafraseado contenido normativo. Los puntos donde el original está incompleto o es una anotación interna sin cerrar se marcan como `[ILEGIBLE]` o se señalan expresamente.

---

## 1. Encuadre del régimen

El régimen especial para trabajadores desplazados a territorio español es uno de los regímenes especiales que la Ley del IRPF contempla, junto a la imputación de rentas inmobiliarias, la transparencia fiscal internacional, los derechos de imagen, la imputación de rentas por socios o partícipes de instituciones de inversión colectiva constituidas en paraísos fiscales y las ganancias patrimoniales por cambio de residencia.

Frente a la regla general de renta mundial —según la cual quienes residan en España más de 183 días tributan por todas las rentas obtenidas durante el año con independencia del país de procedencia—, existen tres regímenes especiales:

- el denominado régimen especial de impatriados (Beckham);
- una norma especial de cautela llamada de cuarentena fiscal;
- el régimen especial opcional para los residentes en un país de la UE diferente de España que obtengan determinadas rentas en nuestro país.

En el IRNR (art. 5 TRLIRNR), son contribuyentes las personas físicas y entidades no residentes que obtengan rentas en España, **salvo que sean contribuyentes del IRPF por aplicación del régimen especial de impatriados**.

---

## 2. En qué consiste el régimen

Se trata de un régimen especial de aplicación para trabajadores desplazados a territorio español. Toda persona que se mude a España con un contrato laboral o como administrador de una sociedad puede optar por este régimen especial.

El beneficio de este régimen es que durante el primer año de residencia fiscal y los 5 años siguientes, es decir, **6 años**, se puede tributar bajo las normas de no residente. Esto implica que sólo se tributará por las rentas obtenidas en España, en lugar de la renta mundial, a un tipo fijo, **con excepción de las rentas del trabajo, que tributarán por renta de fuente mundial desde el momento en que lleguemos a España**.

### Tipos de gravamen aplicables

| Base liquidable | Tipo |
|---|---|
| Hasta 600.000 € | 24 % |
| Exceso sobre 600.000 € | 47 % |

El primer beneficio de la Ley Beckham es tributar a un tipo fijo del 24 %, lo que beneficia si se tienen rentas superiores a 55.000 €. Igualmente, implica que **no se declaran los bienes en el extranjero**.

> ### ⚠️ EL UMBRAL QUE SE DICE AL CLIENTE ES UN RANGO, NO UNA CIFRA
>
> **Decisión del 13/08/2026.** Al cliente se le dice **«entre 50.000 y 55.000 € brutos anuales»**,
> nunca una cifra exacta, **porque depende de la divisa y de la situación concreta**.
>
> El texto de arriba y el de más abajo son **cita literal del manual**, que dice 55.000, y se dejan
> tal cual para no falsear la fuente. Pero **lo que se responde es el rango.**
>
> El motivo de la decisión es que había **tres documentos diciendo cosas distintas**: el manual
> fiscal y el prompt del bot decían 55.000, y el informe que el cliente se lleva a casa decía
> «a partir de unos 50.000». Un cliente podía oír una cifra en el chat y leer otra en su informe.
>
> **Ojo con el falso positivo:** el otro `50.000` que aparece en el informe —el de los Modelos 720
> y 721— **es correcto y no se toca**: ese es el umbral de bienes en el extranjero, que es otra cosa.

Para poder aplicar esta deducción se tiene un plazo de **6 meses** para poder optar al régimen; si pasase dicho plazo ya no se puede optar al régimen.

El problema real es si nuestra renta no es superior a 55.000 €: al aplicarse durante 6 años se debe tener en consideración la posible subida de salario en años próximos para poder decidir si se opta o no por dicho régimen.

Existe la posibilidad de renunciar al régimen en los meses de noviembre y diciembre, lo cual aplicará a partir del año siguiente, pero implica que ya no se podrá optar al régimen en un futuro.

---

## 3. Especialidades desfavorables (lo que NO es ventajoso)

Hay ciertas especialidades a tener en cuenta que no son tan ventajosas:

- **Vivienda habitual e imputación de rentas.** En la ley del IRNR no existe el concepto de vivienda habitual; es decir, si la persona que opta por la Ley Beckham tiene una vivienda en propiedad que constituye vivienda habitual, no podrá estar exenta de tributación en concepto de imputación de renta. Es decir, si la persona en Ley Beckham tiene una vivienda habitual en propiedad, deberá tributar por ella en concepto de imputación de rentas.

- **Aportaciones empresariales a planes de pensiones.** Si se produjeran aportaciones empresariales a planes de pensiones, en el IRPF esto tiene un efecto neutro: se consideran rendimientos del trabajo pero a su vez se reducen. Sin embargo, en la Ley IRNR no existe esa reducción, lo cual implica que dichas aportaciones computan como mayor rendimiento de trabajo sin posibilidad de reducirlas.

- **Prestaciones por maternidad.** Las prestaciones por maternidad en el IRPF están exentas. Sin embargo, en IRNR no está exento: es considerado rendimiento del trabajo y por tanto también para los Beckham.

- **Indemnización por despido.** Lo mismo ocurre con la indemnización por despido, que, bajo el régimen especial, **sí tributa**.

---

## 4. Detección del caso y documentación para el Modelo 151

Cuando creamos que un usuario puede estar acogido al Régimen Especial (Ley Beckham) porque vemos que en sus datos fiscales no aparecen rendimientos del trabajo que él sí se incluye en el proceso de realización de su declaración, tenemos que preguntarle si ha pedido en Hacienda acogerse a dicho régimen en los 6 meses posteriores a su llegada a España.

- Si **no** se ha acogido en esos 6 meses, ya no se podrá optar a dicho régimen: **no hay prórrogas**.
- Si efectivamente **se ha acogido** al Régimen Especial, el siguiente paso es pedirle el **Certificado de Alta en el Régimen Especial** para así proceder a realizarle el **MODELO 151**.

Además, para cumplimentar dicho modelo necesitaremos:

- Certificado de ingresos y retenciones
- Datos fiscales
- Cuenta bancaria
- Dirección
- Confirmar con el cliente los ingresos que ha obtenido de fuente española

---

## 5. Requisitos para optar al Régimen Especial

Para poder optar al régimen especial el contribuyente:

**1. Ha tenido que NO ser residente fiscal en España al menos los últimos 5 años** (antes del 1 de enero de 2023 era de 10 años).

**2. Motivación de un desplazamiento.** Es indispensable que el desplazamiento se motive por un contrato laboral, por un nombramiento como administrador, como autónomo que ejerza una actividad emprendedora, o como cónyuge dependiente.

**3. Solicitud en el plazo de 6 meses desde el alta en Seguridad Social.** Este requisito es indispensable, y hay que tenerlo muy en cuenta, ya que el plazo para solicitar el régimen es bastante breve. A su vez, debe haber cierta relación entre la fecha de llegada y el alta en Seguridad Social, de manera que se motive el desplazamiento.

### 5.1. Vías de acceso según la motivación del desplazamiento

#### 5.1.1. Trabajador para empresa española

Un contrato de trabajo, con excepción de la relación laboral especial de los deportistas profesionales regulada por el RD 1006/1985. Esta circunstancia se considera cumplida cuando se inicia una relación laboral (ordinaria o especial distinta de la anteriormente indicada) o estatutaria con un empleador en España, o cuando el desplazamiento es ordenado por el empleador y existe una carta de desplazamiento de este.

El régimen también resultará aplicable a **profesionales altamente cualificados** que se desplacen a España para llevar a cabo actividades empresariales consistentes en la prestación de servicios a empresas emergentes o actividades de formación e I+D+i.

#### 5.1.2. Teletrabajador internacional (nómada digital)

Con la nueva reforma de la Ley, se permite aplicar este régimen a los empleados que trabajan de forma remota desde España para un empleador extranjero (nómadas digitales), que también calificarán para este régimen cuando su trabajo se realice exclusivamente mediante el uso de medios y sistemas informáticos, telemáticos y de telecomunicación.

Debemos tener en cuenta que deben cumplirse estrictamente los requisitos. Es imprescindible:

- Que se aplique en los primeros 6 meses desde la llegada a España.
- El mantenimiento de la seguridad social en origen firmado con **apostilla de La Haya**. Este requisito es indispensable, ya que se reconoce la relación laboral en el extranjero, con mantenimiento de la Seguridad Social, y la apostilla es la forma de darle validez al mismo. La apostilla la expiden las autoridades fiscales correspondientes del país donde se mantenga la relación laboral.
- Disponer de **visado de teletrabajador internacional**.

#### 5.1.3. Autónomo emprendedor

Es posible aplicar al régimen Beckham como autónomo emprendedor de acuerdo con el **Artículo 70 de la Ley 14/2013**. Tal y como expone este artículo: se entenderá como actividad emprendedora aquella que sea innovadora y/o tenga especial interés económico para España y a tal efecto cuente con un informe favorable emitido por **ENISA** (Empresa Nacional de Innovación).

No es nada sencillo aplicar a Beckham como autónomo emprendedor, por lo que en caso de que nos pregunte un usuario, siempre hay que decirle que es complejo y que tiene que gestionar él la obtención del certificado del ENISA o el visado de autónomo emprendedor.

#### 5.1.4. Cónyuge dependiente o hijos menores de 25 años

Extensión de los beneficios de la Ley Beckham bajo ciertas condiciones a los miembros de la familia que se muden a España con el solicitante, y que:

- no hubieran sido residentes en España por el periodo exigido;
- tampoco obtengan rentas por ejercicio de una actividad profesional;
- y no tengan bases imponibles por importe superior al del contribuyente al que acompañan.

### 5.2. Prueba de la no residencia previa

Hay que tener en cuenta que si la persona no ha sido nunca residente fiscal en España, es muy fácil que no soliciten mayor información sobre este punto.

No obstante, si ha sido residente fiscal tendrá que poder probar ante Hacienda que durante los últimos 5 años no ha vivido en España (no ha sido residente fiscal en España) —con el régimen anterior a 1 de enero de 2023 era de 10 años— con los certificados correspondientes emitidos por el organismo competente del país en cuestión. En el mismo debe figurar «en línea con el Convenio de Doble Imposición firmado con España» o similar.

Los certificados mencionados anteriormente no suponen un requisito para presentar la solicitud, sino que serán documentos que previamente exigiremos nosotros para que, en el hipotético supuesto de que Hacienda requiriera la información/documentación pertinente, podamos probar que efectivamente no había sido residente.

---

## 6. Solicitar la sujeción al Régimen Especial (Modelo 149)

El plazo máximo para solicitar la sujeción al régimen es de **seis meses** desde la fecha en que conste el alta en la Seguridad Social de España, o en la documentación que en su caso permita mantener la legislación de Seguridad Social de origen.

Además, antes de presentar el Modelo, el contribuyente ha tenido que estar en el **censo de obligados tributarios (Modelo 030)**. En teoría, el plazo para su presentación es de 3 meses desde la llegada a España, pero si se presenta fuera de plazo (se suele presentar junto al Modelo 149) no suele haber ningún tipo de problema al respecto.

Para comenzar la solicitud, será necesario que dispongamos de los siguientes documentos:

- DNI
- Autorización para completar este modelo en representación de la persona. En este caso, disponemos de un modelo que debemos actualizar con nuestros datos antes de aportarla.
- Certificado del empleador
- La autorización firmada
- La resolución sobre el reconocimiento de alta en la Seguridad Social. *(El original remite a continuación a una imagen de ejemplo del documento, no reproducible en texto.)*

### 6.1. Casillas y documentación (chuleta operativa del manual)

| Trámite | Casillas | Documentación / notas |
|---|---|---|
| Modelo 030 | Casilla 103 y 107 | NIE (2 caras) y pasaporte |
| Modelo 149 — SOLICITAR ALTA | Casilla 31 | Fecha de entrada en el territorio = fecha de alta en la Seguridad Social. Alta SS + carta de la compañía + autorización + NIE + pasaporte |
| Modelo 149 — SOLICITAR BAJA | Renuncia: casilla 41 / Exclusión: casilla 51 | Ver apartado 7 |

---

## 7. Baja del régimen: renuncia y exclusión (Modelo 149)

En el supuesto en el que quisiéramos dejar de estar sujetos al régimen especial, debemos tramitar dicha solicitud por medio del **Modelo 149**, y además debemos tener en cuenta que existen dos supuestos que se distinguen de la siguiente manera.

### 7.1. Renuncia

Nosotros, de manera voluntaria, decidimos que el próximo año natural no queremos estar sujetos a dicho régimen, porque nuestras circunstancias han cambiado y ya no nos será favorable. Muchos casos son porque a la persona deja de resultarle favorable por un cambio de trabajo con una retribución inferior a 50.000 euros, o por cambios en la situación personal y familiar como nacimiento de hijos, etc.

Deben presentar una **renuncia expresa durante los meses de noviembre y diciembre** anteriores al inicio del año natural en que la renuncia deba surtir efecto. Es decir, si quiere que en 2026 se le deje de aplicar el régimen Beckham, deberá renunciar al mismo en noviembre o diciembre de 2025.

**Ejemplo del manual.** Supongamos que un trabajador acogido al Régimen Beckham experimenta un cambio en su situación personal en 2025, lo que hace que el régimen especial deje de ser beneficioso. Para que la renuncia sea efectiva a partir del 1 de enero de 2026, deberá:

- Presentar el Modelo 149 entre el 1 de noviembre y el 31 de diciembre de 2025.
- Notificar a su empleador sobre la renuncia en el mismo período.

De esta manera, a partir del año 2026, el trabajador pasará a tributar según el régimen general del IRPF.

### 7.2. Exclusión

He dejado de cumplir los requisitos para optar a dicho régimen y, por lo tanto, tengo el plazo de **un mes** para presentar el Modelo para la EXCLUSIÓN.

Las causas de exclusión serán:

- Pérdida de residencia fiscal en España
- Darse de alta como autónomo
- Ser administrador de una empresa y tener a partir de un 25 % de propiedad
- Finalizar una relación laboral

### 7.3. Diferencia clave entre ambos

Ambos casos se deben tramitar con la cumplimentación del mismo Modelo; no obstante, es muy importante diferenciarlos, ya que a través de la **renuncia** el régimen especial dejará de aplicarme el próximo ejercicio en cuestión, y en el supuesto de la **exclusión** ya no me aplicará en el presente (por no cumplir los requisitos exigidos).

### 7.4. Pasos a seguir

Agencia Tributaria: Modelo 149. IRPF. Régimen especial aplicable a los trabajadores desplazados a territorio español.

1. En el enlace → presentación Modelo 149.
2. Identificar con la información solicitada.
3. Seleccionar la casilla correspondiente al punto 4. RENUNCIA (casilla 41) o al punto 5. EXCLUSIÓN (casilla 51).

---

## 8. Consultas vinculantes y doctrina relacionadas con Beckham

### CV 1662-23, de 13 de junio de 2023 — Criptomonedas

**Supuesto:** un contribuyente acogido al régimen especial de trabajadores desplazados (art. 93 LIRPF) realiza operaciones de compraventa de criptomonedas obteniendo ganancias patrimoniales. ¿Están dichas ganancias sujetas a tributación en España bajo este régimen?

**Respuesta:** solo tributarán si las criptomonedas se consideran situadas en territorio español. Esto ocurre en dos supuestos: 1) si el contribuyente realiza la autocustodia de las claves (al residir él en España, el activo se sitúa donde él está); o 2) si el servicio de custodia lo presta una entidad residente en España o un establecimiento permanente en España. Por el contrario, si la custodia la ejerce un tercero no residente (exchange extranjero), se consideran rentas de fuente extranjera y no tributan en este régimen.

### CV V2126-23, de 19 de julio de 2023 — Aportaciones a planes de pensiones

**Supuesto:** un contribuyente acogido al régimen especial de trabajadores desplazados (art. 93 LIRPF, «Ley Beckham») consulta si puede deducirse en su declaración las aportaciones realizadas a un fondo de pensiones.

**Respuesta:** no son deducibles. Dado que la deuda tributaria en este régimen se determina según las normas del Impuesto sobre la Renta de no Residentes (IRNR), no resultan de aplicación las reducciones por aportaciones a sistemas de previsión social previstas en el artículo 51 de la LIRPF. El artículo 26 del TRLIRNR limita las deducciones exclusivamente a donativos y retenciones, por lo que el importe aportado al plan de pensiones no reduce la base imponible y tributa efectivamente al tipo aplicable del régimen (generalmente el 24 %).

### CV 0009-24, de 12 de febrero de 2024 — Paso a administrador con participación del 80 %

**Supuesto:** una persona sujeta al régimen Beckham que tiene trabajo por cuenta ajena constituye una empresa en España en la que tiene un 80 % de participación y renuncia a su empleo para ostentar el cargo de administrador (retribución fija y variable). ¿Cumple los requisitos y debe ser excluido del régimen?

**Respuesta:** si obtiene rendimientos de actividades económicas mediante establecimiento permanente situado en territorio español, se incumplen los requisitos para aplicación del régimen Beckham y, en consecuencia, debe presentar el Modelo 149 comunicando su exclusión, en un plazo de un mes desde que se incumplen los requisitos.

### CV V0425-25, de 20 de marzo de 2025 — RSU devengadas antes del desplazamiento

**Supuesto:** una persona física acogida al régimen especial de trabajadores desplazados (art. 93 LIRPF) recibe entregas de acciones (RSU) de su anterior empleador en Reino Unido tras mudarse a España, las cuales remuneran el trabajo realizado íntegramente en ejercicios anteriores (2020-2023), antes de su desplazamiento. ¿Están estos rendimientos sujetos a tributación en España?

**Respuesta:** no. Las entregas de acciones realizadas tras el desplazamiento no están sujetas a tributación en España, ya que derivan de una actividad desarrollada con anterioridad a la fecha de desplazamiento (art. 114.2.a RIRPF) y no se consideran obtenidas en territorio español según la normativa del IRNR, al no derivar de una actividad personal desarrollada en España.

### Resolución TEAC de 17 de julio de 2025 — Imputación de rentas por la vivienda habitual

**Supuesto:** un contribuyente del IRPF que ha optado por el régimen especial para trabajadores desplazados (art. 93 LIRPF) es titular de un bien inmueble urbano en territorio español que utiliza como su vivienda habitual. ¿Debe tributar por la imputación de rentas inmobiliarias sobre dicha vivienda, o puede aplicar la exención por vivienda habitual prevista en el régimen general del IRPF?

**Respuesta:** sí, debe tributar. El TEAC fija como criterio que estos contribuyentes deben incluir la imputación de rentas inmobiliarias por su vivienda habitual. Esto se debe a que la deuda tributaria en este régimen se determina con arreglo a las normas del Impuesto sobre la Renta de no Residentes (IRNR), cuyo artículo 13.1.h) sujeta a gravamen los inmuebles urbanos no afectos a actividades económicas sin contemplar la exención de la vivienda habitual. La remisión que hace la norma al artículo 85 de la Ley del IRPF es únicamente a efectos de cuantificación (para calcular el importe), pero no permite importar la exención del hecho imponible, ya que el IRNR no atiende a las circunstancias personales del contribuyente.

### V0384/2010 — Exención por reinversión en vivienda habitual (tabla de consultas del manual, pág. 273)

**Supuesto:** venta de vivienda en España por contribuyente que tributa por IRNR (régimen impatriados).

**Normativa citada:** LIRPF art. 93 (régimen desplazados); IRNR (no prevé exención por reinversión).

**Criterio:** no procede la exención por reinversión al tributar por IRNR.

---

## 9. Encaje en el flujo de trabajo: rentas con componente extranjero

Si nos enfrentamos a una renta con componente extranjero (bien porque nos lo haya indicado el propio usuario, bien porque lo sospechemos al salir sus datos fiscales vacíos), las primeras preguntas que debemos hacernos son las siguientes:

1. **¿Es residente o no residente?** Si ha pasado más de 183 días en España, será considerado residente. Para casos de no residentes nos remitimos al apartado de No Residentes.
2. **Si es residente, ¿le aplica el régimen Beckham o régimen especial de impatriados (Modelo 151), o le aplica el régimen normal para residentes (Modelo 100)?**

---

## 10. Modelo 720 y Beckham — anotación interna incompleta en el original

En el apartado del Modelo 720 (declaración informativa sobre bienes y derechos situados en el extranjero), el manual incluye una anotación de trabajo sin cerrar:

> «¿EXENCIONES? Los acogidos al régimen Beckham, [ILEGIBLE — la frase queda cortada en el original; figura a continuación la marca interna "(MIRAR?)", indicando que el punto estaba pendiente de revisión por los autores del manual]»

El único enunciado cerrado del manual sobre esta cuestión es el recogido en el apartado 2 de este corpus: acogerse al régimen «implica que no se declaran los bienes en el extranjero».

---

## Marcas de contenido no recuperable

- **Apartado 6:** el manual inserta una captura de la resolución de alta en la Seguridad Social como ejemplo visual; no es texto y no se ha reproducido.
- **Apartado 6.1:** la chuleta de casillas aparece en el original como notas sueltas de maquetación; se ha tabulado sin añadir información.
- **Apartado 10:** `[ILEGIBLE]` — frase cortada en el PDF original sobre exenciones del Modelo 720 para acogidos al régimen Beckham.
