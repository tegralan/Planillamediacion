# Formulario de solicitud de mediación

Centro de Mediación y Métodos Alternativos de Abordaje y Solución de Conflictos
Consejo de la Magistratura de la Ciudad Autónoma de Buenos Aires

Formulario para que el organismo requirente cargue los datos de las partes y
remita la solicitud junto con el art. 92.

---

## Un solo código, dos vías

El mismo formulario funciona de dos maneras. Lo único que cambia es
**`config.js`** — cinco líneas. Todo el resto del código es idéntico, así que
cualquier arreglo o mejora sirve para las dos vías sin duplicar nada.

| | Demostración | Producción |
|---|---|---|
| Dónde vive | GitHub Pages | Intranet o SharePoint del organismo |
| `modo` | `"manual"` o `"forms"` | `"powerautomate"` |
| Licencia | ninguna | Power Automate Premium |
| Clics para enviar | 3 | 1 |
| Datos reales | **no** | sí |

---

## Archivos

```
index.html      el formulario: marcado y estilos
app.js          la lógica: partes, validaciones, envío
construir.js    genera la ficha .docx
membrete.js     el membrete institucional en base64
config.js       <-- el único archivo que cambia entre entornos
```

No hay compilación ni dependencias que instalar. Se edita, se guarda, se abre.
Funciona igual abierto desde el disco que publicado en un servidor.

Las dos únicas bibliotecas externas —JSZip para armar el .docx y pdf-lib para
contar las carillas del art. 92— se cargan desde CDN.

---

## Vía 1 · Demostración en GitHub Pages

Sirve para mostrar cómo funciona antes de que la oficina adquiera la licencia.

1. Crear un repositorio y subir estos archivos.
2. **Settings → Pages → Source: Deploy from a branch → main / (root)**.
3. En `config.js`:

```js
modo: "manual",
demostracion: true
```

4. Esperar un minuto. El formulario queda en
   `https://<usuario>.github.io/<repositorio>/`

Con `demostracion: true` aparece un cartel arriba avisando que no se carguen
datos reales. Se puede probar todo: agregar partes, pegar listados, el control
de carillas del art. 92, generar la ficha en Word y en PDF.

### Qué NO subir a un repositorio abierto

**La URL del flujo de Power Automate.** Lleva la firma incorporada y funciona sin
autenticación: quien la tenga puede disparar envíos desde la casilla del Centro.
Y GitHub conserva el historial — borrarla después no alcanza, queda en los
commits anteriores.

Por eso `config.js` viene con `flujoUrl` vacío y así debe quedar en el
repositorio público.

**Datos de causas.** Ninguna captura, ninguna ficha de prueba con nombres reales,
ningún art. 92. Para las demostraciones, datos inventados.

---

## Vía 2 · Producción con Power Automate Premium

1. Armar el flujo siguiendo `como_armar_el_flujo.md`.
2. Copiar la URL del disparador.
3. En `config.js`, **en la copia que se usa en la oficina**:

```js
modo: "powerautomate",
flujoUrl: "https://prod-00.westus.logic.azure.com:443/workflows/...&sig=...",
demostracion: false
```

4. Dejar los archivos en la intranet o en un sitio de SharePoint del organismo.

El botón **Enviar** manda la ficha y el art. 92 a la casilla, sin adjuntar nada
a mano.

### Cómo conviven las dos copias

El repositorio es la fuente. La copia de producción se baja del repositorio y se
le edita únicamente `config.js`. Cuando haya cambios, se vuelve a bajar y se
vuelve a editar ese archivo — o se guarda una copia del `config.js` de producción
aparte y se pisa después de cada actualización.

---

## Vía intermedia · Microsoft Forms, sin licencia

Si la licencia no sale, `modo: "forms"` con `formsUrl` completada. Descarga la
ficha y abre un Microsoft Forms donde se suben los dos archivos; un flujo
estándar manda el correo. Los detalles están en `envio_sin_premium_forms.md`.

El enlace de Forms **sí** se puede publicar: exige inicio de sesión de la
organización, así que nadie de afuera puede usarlo.

---

## Sobre las APIs de modelos de lenguaje

No intervienen en este circuito. Un modelo de lenguaje no envía correos ni guarda
archivos, y una clave de API dentro de una página pública queda expuesta para que
cualquiera la use por cuenta del titular.

El envío tiene que salir de Microsoft, que es donde está la casilla.
