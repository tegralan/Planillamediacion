# Ficha de datos para mediación

Formulario para armar la **Ficha de Datos para Mediación** del Centro de Mediación y Métodos
Alternativos de Abordaje y Solución de Conflictos — Consejo de la Magistratura de la Ciudad
Autónoma de Buenos Aires.

Es un solo archivo HTML. Se abre con doble clic, se completa y descarga la ficha en Word o en
PDF, lista para remitir junto con el art. 92.

Marco normativo: Resolución CM N° 65/2020 y MEMO 77-2020.

---

## Los datos no salen de la máquina

El formulario **no envía nada a ningún servidor**. Todo —incluidos DNI, domicilios y teléfonos
de las partes— se procesa en el navegador y el archivo se descarga localmente. No hay backend,
no hay base de datos, no hay analítica.

El botón «Preparar el correo» abre el programa de correo del equipo con el destinatario, el
asunto y el cuerpo ya escritos; los adjuntos se agregan a mano, porque ninguna página web
puede adjuntar archivos a un correo.

Tampoco necesita internet: las dos librerías que usa están embebidas en el archivo, así que
funciona igual en una red sin salida.

---

## Uso

1. Descargar `formulario_ficha.html`
   ([enlace directo](../../raw/main/formulario_ficha.html)).
2. Abrirlo con doble clic. Sirve cualquier navegador moderno; no hay que instalar nada.
3. Completar y elegir:

| Botón | Qué hace |
|---|---|
| **Ficha en Word** | Descarga el `.docx` con el nombre `<causa>-<año>.docx`, por ejemplo `161743-26.docx` |
| **Ficha en PDF** | Abre el diálogo de impresión; elegir *Guardar como PDF* |
| **Preparar el correo** | Abre el correo dirigido a `mediaciononline@jusbaires.gob.ar` con el resumen de la causa |
| **Vaciar el formulario** | Borra todo lo cargado |

---

## Qué controla solo

- **Habilitación en el expediente.** Es el ítem obligatorio. Sin el tilde no deja preparar el
  correo: sin la habilitación cargada en EJE el Centro no puede intervenir.
- **Vencimiento de la IPP.** Avisa según la fecha: verde si falta más de un mes, naranja si
  quedan 30 días o menos, rojo si ya venció.
- **Art. 92.** Cuenta las carillas del PDF y rechaza el que tenga más de 2.
- **Partes sin teléfono o sin domicilio.** Avisa cuántas son. Si la audiencia es virtual el
  teléfono de la parte es imprescindible, y el del abogado no lo reemplaza.
- **Datos faltantes.** Lista los campos incompletos al generar.

---

## Campos

Los títulos coinciden con las filas de `FICHA_MEDIACION_plantilla PARA NOTIFICAR.docx`, que
está en este repositorio como referencia de lo que tiene que salir.

| Sección | Campos |
|---|---|
| Identificación de la causa | CUIJ EJE · MPF · carátula · objeto de autos (DDH) · vencimiento de la IPP · plazo para gestionar · modalidad requerida |
| Parte denunciante | nombre · DNI/pasaporte · teléfono fijo · celular · domicilio · correo · conformidad |
| Parte denunciada | los mismos |
| Defensa del denunciado | defensoría o abogado particular · teléfono · correo |
| Otros intervinientes | querella particular · Asesoría Tutelar · teléfono de la Asesoría |
| Contacto de fiscalía | fiscalía interviniente · responsable de la causa · teléfono · correo · sumariante |

Admite **varias partes** de cada lado. Con «Pegar listado» se cargan de a muchas: una por
renglón, con los datos separados por tabulaciones, como salen de una planilla.

La **modalidad** se indica al solicitar, para evitar reprogramaciones. La fecha de la audiencia
depende de la disponibilidad de salas.

---

## Volcado al Excel *Mediaciones Virtuales*

La ficha en Word termina con unos renglones en letra chica y gris, del tipo:

```
CUIJ: J-01-00161743-1/2026-0
MPF: 1328316
Denunciante: Francisco Daniel Addisi; Marta Elena Gómez
Imputado: Matias Ezequiel Burgos
Fiscalía: Fiscalía PCyF Nº 6
Defensa: Defensoría PCyF Nº 1
Querella particular: Dra. Laura Sánchez
Asesoría Tutelar: Asesoría Tutelar Nº 2
```

Ese bloque existe para que el volcado a la planilla *Mediaciones Virtuales* sea automático: el
script de carga busca renglones con ese formato, no lee las tablas. **Si se cambian esas
etiquetas, el volcado deja de funcionar.**

La querella y la Asesoría Tutelar solo se imprimen si están cargadas. Es a propósito: si el
rótulo apareciera vacío, el script leería la palabra «querella» y cargaría una querella que
no existe.

---

## Publicarlo en una URL

Con el repositorio público se sirve gratis desde GitHub Pages, para abrirlo sin descargarlo:
*Settings → Pages → Source: Deploy from a branch → main / (root)*.

El `index.html` de la raíz existe solo para eso: redirige a `formulario_ficha.html`, así la
dirección corta del sitio abre el formulario. **Sin ese archivo, GitHub Pages convierte este
README en la página de inicio y el formulario no aparece.**

Igual conviene tener el archivo bajado: así funciona aunque no haya internet.

---

## Licencia

MIT — ver [`LICENSE`](LICENSE).

El archivo trae dos librerías embebidas, ambas usadas bajo licencia MIT:

| Librería | Versión | Para qué | Licencia |
|---|---|---|---|
| [JSZip](https://stuk.github.io/jszip/) | 3.10.1 | armar el `.docx` | MIT o GPLv3, a elección — acá se usa bajo MIT ([texto](licencias-de-terceros/JSZip-LICENSE.md)) |
| [pdf-lib](https://pdf-lib.js.org/) | 1.17.1 | contar las carillas del art. 92 | MIT ([texto](licencias-de-terceros/pdf-lib-LICENSE.md)) |

El membrete del Poder Judicial de la Ciudad de Buenos Aires — Consejo de la Magistratura no
está alcanzado por la licencia MIT: es un signo institucional y su uso corresponde al organismo.
