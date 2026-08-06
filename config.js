/* ===================================================================
   CONFIGURACIÓN

   Este es el único archivo que cambia entre un entorno y otro.
   El resto del código es idéntico en los dos.

   Para cambiar de vía: editar "modo" y completar la URL que corresponda.
   =================================================================== */

var CONFIG = {

  /* Vía de envío. Valores posibles:

     "manual"        Descarga la ficha y abre el correo escrito.
                     Los adjuntos se agregan a mano. No necesita nada.

     "forms"         Descarga la ficha y abre un Microsoft Forms donde
                     se suben la ficha y el art. 92. Un flujo de Power
                     Automate estándar manda el correo.
                     Completar formsUrl.

     "powerautomate" Envía todo de una, sin intervención.
                     Necesita licencia Power Automate Premium.
                     Completar flujoUrl.
  */
  modo: "manual",

  /* URL del disparador HTTP del flujo de Power Automate.
     Se obtiene al guardar el flujo, en el campo "URL de HTTP".

     NO PUBLICAR ESTA URL EN UN REPOSITORIO ABIERTO.
     Lleva la firma incorporada: quien la tenga puede disparar envíos
     desde la casilla del Centro. Y GitHub conserva el historial: aunque
     se borre después, queda en los commits anteriores.  */
  flujoUrl: "",

  /* Enlace para responder del Microsoft Forms.
     Este sí se puede publicar: el formulario exige inicio de sesión de
     la organización, así que nadie de afuera puede usarlo.  */
  formsUrl: "",

  /* Casillas */
  destino: "mediaciononline@jusbaires.gob.ar",
  remitente: "mediaciononline@jusbaires.gob.ar",

  /* Cartel de demostración.
     Ponerlo en true cuando el formulario esté publicado para mostrar
     cómo funciona. Muestra un aviso visible de que no se carguen datos
     reales de causas.  */
  demostracion: false
};
