# Formulario de solicitud de mediación

Centro de Mediación y Métodos Alternativos de Abordaje y Solución de Conflictos
Consejo de la Magistratura de la Ciudad Autónoma de Buenos Aires

Formulario para cargar los datos de las partes de una causa, generar la ficha
del protocolo de actuación y dejar armada la carpeta de la causa en la unidad de
red, con la ficha y el art. 92 adentro.

---

## Qué hace

- **Partes ilimitadas.** Agrega denunciantes y denunciados de a uno, o pega un
  listado entero cuando son decenas.
- **Controla el art. 92.** Abre el PDF, cuenta las carillas y rechaza los de más
  de dos.
- **Genera la ficha** en Word o en PDF, con el membrete, el texto del protocolo
  (Resolución CM Nº 65/2020 y MEMO 77-2020) y la constancia de conformidad.
- **Arma la carpeta de la causa** con el nombre derivado del CUIJ, y guarda
  adentro la ficha y el art. 92 renombrado.
- **Avisa lo que falta**: campos obligatorios, partes sin teléfono, art. 92 sin
  cargar. Avisa, no bloquea.

Todo ocurre en el navegador. Ningún dato sale de la computadora.

---

## Archivos

```
index.html      el formulario: marcado y estilos
app.js          la lógica: partes, validaciones, carpeta
construir.js    genera la ficha .docx
membrete.js     el membrete institucional en base64
config.js       <-- el único archivo que cambia entre entornos
```

No hay compilación ni dependencias que instalar. Se edita, se guarda, se abre.
Funciona igual abierto desde el disco que publicado en un servidor.

Las dos bibliotecas externas —JSZip para armar el .docx y pdf-lib para contar
las carillas— se cargan desde CDN.

---

## Cómo se usa

1. Cargar los datos de la causa y las partes.
2. Adjuntar el art. 92.
3. **Crear la carpeta de la causa.** El navegador pide elegir la carpeta del año
   una vez por sesión; después crea `<número>-<aa>` adentro y guarda los dos
   archivos.

El nombre sale del CUIJ: `J-01-00161743-1/2026-0` da la carpeta `161743-26`
dentro del año `2026`.

Requiere Microsoft Edge o Chrome. Otros navegadores no pueden escribir en
carpetas; en ese caso el formulario indica los pasos para hacerlo a mano.

---

## Configuración

`config.js` tiene tres opciones:

| Opción | Para qué |
|---|---|
| `rutaCausas` | la ruta de la unidad de red, que se muestra como referencia |
| `destino` | la casilla del Centro, que aparece al pie de la ficha |
| `demostracion` | `true` muestra un cartel avisando que no se carguen datos reales |

Para publicar el formulario como demostración, poner `demostracion: true`.

---

## Qué NO subir a un repositorio abierto

**Datos de causas.** Ninguna ficha de prueba con nombres reales, ningún art. 92,
ninguna captura con datos de partes. Para las demostraciones, datos inventados.

El `.gitignore` bloquea `*.docx` y `*.pdf` por ese motivo.

---

## Publicar como demostración

1. **Settings → Pages → Source: Deploy from a branch → main / (root)**.
2. En `config.js`, `demostracion: true`.

Queda en `https://<usuario>.github.io/<repositorio>/`.

No hace falta publicarlo para usarlo: bajando los archivos a una carpeta y
abriendo `index.html` funciona igual.
