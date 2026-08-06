(function () {
  "use strict";

  document.getElementById("membrete").src = "data:image/png;base64," + MEMBRETE_B64;

  if (CONFIG.demostracion) {
    var b = document.createElement("div");
    b.className = "aviso";
    b.style.margin = "0 0 18px";
    b.innerHTML = "<strong>Demostración</strong>Este formulario está publicado para " +
      "mostrar cómo funciona. No cargar datos reales de causas ni documentación de expedientes.";
    var w = document.querySelector(".wrap");
    w.insertBefore(b, w.children[1]);
  }

  function bytesDeB64(b64) {
    var bin = atob(b64), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c];
    });
  }

  var estado = { denunciantes: [], denunciados: [], art92: null, art92ok: false };

  var CAMPOS = [
    { k:"nombre",  et:"Nombre y apellido", ancho:true },
    { k:"doc",     et:"DNI / Pasaporte" },
    { k:"fijo",    et:"Teléfono fijo" },
    { k:"celular", et:"Celular" },
    { k:"mail",    et:"Correo electrónico" },
    { k:"conformidad", et:"Conformidad", ops:["", "Sí", "No", "Pendiente", "Sin contacto"] }
  ];

  var ETIQUETA = { denunciantes: "Denunciante", denunciados: "Denunciado" };

  function nuevaParte() {
    return { nombre:"", doc:"", fijo:"", celular:"", mail:"", conformidad:"" };
  }

  function pintarPartes(tipo) {
    var cont = document.getElementById(tipo);
    var lista = estado[tipo];

    document.getElementById(tipo === "denunciantes" ? "cDte" : "cDdo").textContent = lista.length;

    if (!lista.length) {
      cont.innerHTML = '<p class="vacio">Todavía no hay ' + ETIQUETA[tipo].toLowerCase() + "s cargados.</p>";
      return;
    }

    cont.innerHTML = lista.map(function (p, i) {
      return '<div class="parte"><header><h3>' + ETIQUETA[tipo] + " " + (i + 1) + "</h3>" +
        '<button class="sec mini" data-quitar="' + tipo + '" data-i="' + i + '">Quitar</button></header>' +
        '<div class="cuerpo">' + CAMPOS.map(function (c) {
          var id = tipo + "-" + i + "-" + c.k;
          var control = c.ops
            ? '<select id="' + id + '" data-t="' + tipo + '" data-i="' + i + '" data-k="' + c.k + '">' +
              c.ops.map(function (o) {
                return '<option value="' + esc(o) + '"' + (p[c.k] === o ? " selected" : "") + ">" +
                  esc(o || "— elegir —") + "</option>";
              }).join("") + "</select>"
            : '<input type="text" id="' + id + '" value="' + esc(p[c.k]) +
              '" data-t="' + tipo + '" data-i="' + i + '" data-k="' + c.k + '">';
          return '<div class="campo' + (c.ancho ? " full" : "") + '">' +
            '<label class="et" for="' + id + '">' + esc(c.et) + "</label>" + control + "</div>";
        }).join("") + "</div></div>";
    }).join("");

    Array.prototype.forEach.call(cont.querySelectorAll("[data-k]"), function (el) {
      el.addEventListener("input", function () {
        estado[el.dataset.t][+el.dataset.i][el.dataset.k] = el.value;
      });
      el.addEventListener("change", function () {
        estado[el.dataset.t][+el.dataset.i][el.dataset.k] = el.value;
      });
    });

    Array.prototype.forEach.call(cont.querySelectorAll("[data-quitar]"), function (b) {
      b.addEventListener("click", function () {
        estado[b.dataset.quitar].splice(+b.dataset.i, 1);
        pintarPartes(b.dataset.quitar);
      });
    });
  }

  // Pegar varias partes: una por linea, campos separados por tabulacion o punto y coma
  function pegarListado(tipo) {
    var texto = window.prompt(
      "Pegar una parte por línea.\n" +
      "Campos separados por tabulación o punto y coma, en este orden:\n\n" +
      "Nombre y apellido · DNI · Teléfono fijo · Celular · Correo\n\n" +
      "Alcanza con el nombre; el resto puede quedar vacío.");
    if (!texto) return;

    var agregadas = 0;
    texto.split(/\r?\n/).forEach(function (linea) {
      if (!linea.trim()) return;
      var c = linea.split(/\t|;/).map(function (x) { return x.trim(); });
      estado[tipo].push({
        nombre: c[0] || "", doc: c[1] || "", fijo: c[2] || "",
        celular: c[3] || "", mail: c[4] || "", conformidad: ""
      });
      agregadas++;
    });

    pintarPartes(tipo);
    if (agregadas) {
      mostrar('<div class="listo"><strong>' + agregadas + " " +
        ETIQUETA[tipo].toLowerCase() + "(s) agregado(s)</strong>Revisá los datos antes de generar la ficha.</div>");
    }
  }

  function mostrar(html) { document.getElementById("resultado").innerHTML = html; }

  /* ---------------- art. 92 ---------------- */

  document.getElementById("art92").addEventListener("change", function (e) {
    var f = e.target.files[0];
    var caja = document.getElementById("estadoArt92");
    estado.art92 = null; estado.art92ok = false;
    if (!f) { caja.innerHTML = ""; return; }

    if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") {
      caja.innerHTML = '<div class="aviso"><strong>Tiene que ser un PDF</strong>' +
        esc(f.name) + " no lo es.</div>";
      e.target.value = "";
      return;
    }

    caja.innerHTML = '<p class="pie">Contando las carillas…</p>';

    f.arrayBuffer().then(function (buf) {
      return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
    }).then(function (pdf) {
      var n = pdf.getPageCount();
      if (n > 2) {
        caja.innerHTML = '<div class="aviso"><strong>El PDF tiene ' + n + " carillas</strong>" +
          "El art. 92 se admite con 2 como máximo. Recortalo antes de adjuntarlo.</div>";
        document.getElementById("art92").value = "";
      } else {
        estado.art92 = f; estado.art92ok = true;
        caja.innerHTML = '<div class="listo"><strong>Art. 92 correcto</strong>' +
          esc(f.name) + " · " + n + (n === 1 ? " carilla" : " carillas") +
          " · " + Math.round(f.size / 1024) + " KB. Adjuntalo al correo junto con la ficha.</div>";
      }
    }).catch(function () {
      caja.innerHTML = '<div class="aviso"><strong>No se pudo leer el PDF</strong>' +
        "Puede estar dañado o protegido. Probá abrirlo y volver a guardarlo.</div>";
      document.getElementById("art92").value = "";
    });
  });

  /* ---------------- nombre del archivo ---------------- */

  function nombreArchivo(cuij) {
    var m = String(cuij).match(/(?:[A-Z]-)?\d{2}-0*(\d+)-\d+\/(\d{2})(\d{2})-/i);
    return m ? m[1] + "-" + m[3] : "ficha";
  }

  /* ---------------- generación ---------------- */

  function leer(id) { return document.getElementById(id).value.trim(); }

  var DESTINO = CONFIG.destino;

  function recolectar() {
    var d = {
      cuij: leer("cuij"), caratula: leer("caratula"), ddh: leer("ddh"),
      denunciantes: estado.denunciantes, denunciados: estado.denunciados,
      defensa: leer("defensa"), defensaTel: leer("defensaTel"), defensaMail: leer("defensaMail"),
      asesoria: leer("asesoria"), asesoriaTel: leer("asesoriaTel"),
      fiscalia: leer("fiscalia"), fiscaliaResp: leer("fiscaliaResp"),
      fiscaliaTel: leer("fiscaliaTel"), fiscaliaMail: leer("fiscaliaMail"),
      plazo: leer("plazo"), modalidad: leer("modalidad")
    };

    var faltan = [];
    if (!d.cuij) faltan.push("CUIJ EJE");
    if (!d.caratula) faltan.push("carátula");
    if (!d.ddh) faltan.push("objeto de autos (DDH)");
    if (!d.denunciantes.length) faltan.push("al menos un denunciante");
    if (!d.denunciados.length) faltan.push("al menos un denunciado");
    if (!d.defensa) faltan.push("defensa del denunciado");
    if (!d.modalidad) faltan.push("modalidad");

    var sinTel = d.denunciantes.concat(d.denunciados).filter(function (p) {
      return !p.fijo && !p.celular;
    }).length;

    return { datos: d, faltan: faltan, sinTel: sinTel };
  }

  function avisosPendientes(r, incluirArt92) {
    var html = "";
    if (r.faltan.length) {
      html += '<div class="aviso"><strong>Quedó incompleta</strong>Falta: ' +
        esc(r.faltan.join(" · ")) + ".</div>";
    }
    if (r.sinTel) {
      html += '<div class="aviso"><strong>' + r.sinTel +
        " parte(s) sin teléfono</strong>Si la audiencia es virtual, los teléfonos de las partes " +
        "son imprescindibles. El del abogado no reemplaza al de la parte.</div>";
    }
    if (incluirArt92 && !estado.art92ok) {
      html += '<div class="aviso"><strong>Falta el art. 92</strong>' +
        "La ficha se remite junto con el Decreto de Determinación de los Hechos.</div>";
    }
    return html;
  }

  /* ---------------- Word ---------------- */

  document.getElementById("generar").addEventListener("click", function () {
    var r = recolectar();
    var zip = construirFicha(JSZip, r.datos, bytesDeB64(MEMBRETE_B64));
    zip.generateAsync({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }).then(function (blob) {
      var nombre = nombreArchivo(r.datos.cuij) + ".docx";
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = nombre; a.click();
      URL.revokeObjectURL(url);
      mostrar('<div class="listo"><strong>Ficha en Word descargada</strong>' + esc(nombre) +
        " con " + r.datos.denunciantes.length + " denunciante(s) y " +
        r.datos.denunciados.length + " denunciado(s).</div>" + avisosPendientes(r, true));
    }).catch(function (err) {
      mostrar('<div class="aviso"><strong>No se pudo generar la ficha</strong>' +
        esc(err.message || err) + "</div>");
    });
  });

  /* ---------------- PDF ---------------- */

  function tablaHTML(filas) {
    return "<table>" + filas.map(function (f) {
      return '<tr><td class="lab">' + esc(f[0]) + "</td><td>" + esc(f[1] || "") + "</td></tr>";
    }).join("") + "</table>";
  }

  function vistaImpresion(d) {
    var h = '<img class="mem" src="data:image/png;base64,' + MEMBRETE_B64 + '" alt="">';
    h += '<p class="frase">\u201CCentro de Mediación y Métodos Alternativos de Abordaje y Solución de Conflictos\u201D</p>';
    h += "<h1>PROTOCOLO DE ACTUACIÓN PARA MEDIACIÓN</h1>";
    h += '<p class="intro">Por el presente, y atento al protocolo de actuación previsto en la resolución ' +
      "del CM Nº 65/2020 que habilitó la tramitación de las causas de manera remota, y al MEMO 77-2020 " +
      "que reglamenta el sistema de la virtualidad en las mediaciones.</p>";
    h += '<p class="intro"><strong>La ficha con los datos completos de las partes:</strong></p>';

    h += "<h2>Identificación de la causa</h2>" + tablaHTML([
      ["CUIJ EJE", d.cuij], ["Carátula", d.caratula], ["Objeto de autos (DDH)", d.ddh]]);
    h += '<p class="nota">El objeto de autos (DDH) es imprescindible. Debe consignarse el CUIJ de EJE.</p>';

    var bloque = function (t, p) {
      return "<h2>" + esc(t) + "</h2>" + tablaHTML([
        ["Nombre y apellido", p.nombre], ["DNI / Pasaporte u otro", p.doc],
        ["Teléfono fijo", p.fijo], ["Celular", p.celular], ["Correo electrónico", p.mail]]);
    };
    d.denunciantes.forEach(function (p, i) { h += bloque("Parte denunciante " + (i + 1), p); });
    d.denunciados.forEach(function (p, i) { h += bloque("Parte denunciada " + (i + 1), p); });
    h += '<p class="nota">Los números de teléfono fijo y/o celulares son imprescindibles.</p>';

    h += "<h2>Defensoría interviniente o abogado particular</h2>" + tablaHTML([
      ["Defensoría / abogado particular", d.defensa],
      ["Teléfono de contacto", d.defensaTel], ["Correo electrónico", d.defensaMail]]);

    h += "<h2>Asesoría Tutelar</h2>" + tablaHTML([
      ["Asesoría Tutelar de la causa", d.asesoria], ["Teléfono de contacto", d.asesoriaTel]]);
    h += '<p class="nota">Se completa si hay personas menores de edad y resulta necesaria su intervención.</p>';

    h += "<h2>Contacto de fiscalía</h2>" + tablaHTML([
      ["Fiscalía interviniente", d.fiscalia], ["Responsable de la causa", d.fiscaliaResp],
      ["Teléfono", d.fiscaliaTel], ["Correo electrónico", d.fiscaliaMail],
      ["Plazo para gestionar la mediación", d.plazo], ["Modalidad requerida", d.modalidad]]);

    h += "<h2>Conformidad de las partes</h2>";
    h += '<p class="conf">Asimismo, se deberá dejar constancia de la voluntad de las partes para ' +
      "realizar el proceso de mediación o conciliación.</p>";
    var confs = [];
    d.denunciantes.forEach(function (p, i) { confs.push(["Conformidad del denunciante " + (i + 1), p.conformidad]); });
    d.denunciados.forEach(function (p, i) { confs.push(["Conformidad del denunciado " + (i + 1), p.conformidad]); });
    h += tablaHTML(confs);

    h += '<p class="cierre">Remitir a ' + DESTINO + " o realizar la actuación por el sistema EJE, según corresponda.</p>";
    return h;
  }

  document.getElementById("generarPdf").addEventListener("click", function () {
    var r = recolectar();
    document.getElementById("impresion").innerHTML = vistaImpresion(r.datos);
    mostrar('<div class="listo"><strong>Se abre el diálogo de impresión</strong>' +
      "Elegir <em>Guardar como PDF</em> como destino y nombrar el archivo <strong>" +
      esc(nombreArchivo(r.datos.cuij)) + ".pdf</strong>.</div>" + avisosPendientes(r, true));
    window.setTimeout(function () { window.print(); }, 120);
  });

  /* ---------------- correo ---------------- */

  var REMITENTE = CONFIG.remitente;

  function aBase64(blob) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () { res(String(fr.result).split(",")[1]); };
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
  }

  document.getElementById("enviar").addEventListener("click", function () {
    var r = recolectar();

    if (r.faltan.length) {
      mostrar('<div class="aviso"><strong>No se puede enviar incompleta</strong>Falta: ' +
        esc(r.faltan.join(" · ")) + ".</div>");
      return;
    }
    if (!estado.art92ok) {
      mostrar('<div class="aviso"><strong>Falta el art. 92</strong>' +
        "El Decreto de Determinación de los Hechos se remite junto con la ficha.</div>");
      return;
    }

    // Sin flujo Premium: se descarga la ficha y se abre el Forms para subirla
    if (CONFIG.modo === "forms" && CONFIG.formsUrl) {
      var tF = textosCorreo(r.datos);
      var zipF = construirFicha(JSZip, r.datos, bytesDeB64(MEMBRETE_B64));
      zipF.generateAsync({ type: "blob" }).then(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url; a.download = tF.base + ".docx"; a.click();
        URL.revokeObjectURL(url);
        window.open(CONFIG.formsUrl, "_blank", "noopener");
        mostrar('<div class="listo"><strong>Ficha descargada y formulario abierto</strong>' +
          "Quedan dos pasos en la otra pestaña.</div>" +
          '<div class="aviso"><strong>Qué subir</strong>' +
            "1. CUIJ: <strong>" + esc(r.datos.cuij) + "</strong><br>" +
            "2. Ficha: <strong>" + esc(tF.base) + ".docx</strong> (recién descargada)<br>" +
            "3. Art. 92: <strong>" + esc(estado.art92.name) + "</strong>" +
          "</div>");
      });
      return;
    }

    if (CONFIG.modo !== "powerautomate" || !CONFIG.flujoUrl) {
      mostrar('<div class="aviso"><strong>El envío directo no está configurado</strong>' +
        "En <span style=\"font-family:var(--mono)\">config.js</span>, poner " +
        "<span style=\"font-family:var(--mono)\">modo</span> en " +
        "<span style=\"font-family:var(--mono)\">\"powerautomate\"</span> y completar " +
        "<span style=\"font-family:var(--mono)\">flujoUrl</span>, o " +
        "<span style=\"font-family:var(--mono)\">\"forms\"</span> y completar " +
        "<span style=\"font-family:var(--mono)\">formsUrl</span>.<br><br>" +
        "Mientras tanto: <strong>Ficha en Word</strong> o <strong>Ficha en PDF</strong>, " +
        "y después <strong>Preparar el correo</strong>.</div>");
      return;
    }

    var boton = document.getElementById("enviar");
    boton.disabled = true;
    boton.textContent = "Enviando…";
    mostrar('<p class="pie">Armando la ficha y enviando…</p>');

    var t = textosCorreo(r.datos);
    var zip = construirFicha(JSZip, r.datos, bytesDeB64(MEMBRETE_B64));

    zip.generateAsync({ type: "blob" })
      .then(function (blob) {
        return Promise.all([aBase64(blob), aBase64(estado.art92)]);
      })
      .then(function (partes) {
        // text/plain evita el preflight CORS, que Power Automate no responde
        return fetch(CONFIG.flujoUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({
            destinatario: DESTINO,
            remitente: REMITENTE,
            asunto: t.asunto,
            cuerpo: t.cuerpo,
            cuij: r.datos.cuij,
            caratula: r.datos.caratula,
            modalidad: r.datos.modalidad,
            fiscalia: r.datos.fiscalia,
            denunciantes: r.datos.denunciantes,
            denunciados: r.datos.denunciados,
            ficha: { nombre: t.base + ".docx", contenido: partes[0] },
            art92: { nombre: estado.art92.name, contenido: partes[1] }
          })
        });
      })
      .then(function (resp) {
        if (!resp.ok) throw new Error("El servidor respondió " + resp.status);
        mostrar('<div class="listo"><strong>Solicitud enviada</strong>' +
          "Se remitió a " + esc(DESTINO) + " la ficha " + esc(t.base) +
          ".docx junto con el art. 92.</div>");
      })
      .catch(function (err) {
        // Si el flujo no devuelve el encabezado CORS, el navegador tapa la
        // respuesta aunque el envio haya salido. Se reintenta a ciegas.
        if (err && err.name === "TypeError") {
          mostrar('<div class="aviso"><strong>Enviado, pero sin confirmación</strong>' +
            "El navegador no pudo leer la respuesta del flujo. Es muy probable que el " +
            "correo haya salido igual.<br><br>Verificalo en Power Automate, en " +
            "<strong>Mis flujos → Historial de ejecuciones</strong>.<br>" +
            "Para que confirme bien, agregá al paso <strong>Respuesta</strong> el " +
            "encabezado <span style=\"font-family:var(--mono)\">Access-Control-Allow-Origin: *</span>." +
            "</div>");
          return;
        }
        mostrar('<div class="aviso"><strong>No se pudo enviar</strong>' +
          esc(err.message || err) + "<br><br>Descargá la ficha y usá " +
          "<strong>Preparar el correo</strong> para mandarla a mano.</div>");
      })
      .then(function () {
        boton.disabled = false;
        boton.textContent = "Enviar";
      });
  });

  var REMITENTE = CONFIG.remitente;

  function textosCorreo(d) {
    var base = nombreArchivo(d.cuij);
    var asunto = "SOLICITUD DE MEDIACIÓN — " + (d.cuij || "sin CUIJ") +
      (d.caratula ? " — " + d.caratula : "");
    var cuerpo =
      "Estimados/as:\n\n" +
      "Se remite solicitud de mediación en los términos del protocolo de actuación " +
      "(Resolución CM Nº 65/2020 y MEMO 77-2020).\n\n" +
      "CUIJ EJE: " + (d.cuij || "-") + "\n" +
      "Carátula: " + (d.caratula || "-") + "\n" +
      "Modalidad requerida: " + (d.modalidad || "-") + "\n" +
      "Partes: " + d.denunciantes.length + " denunciante(s) y " + d.denunciados.length + " denunciado(s)\n" +
      "Fiscalía: " + (d.fiscalia || "-") + "\n\n" +
      "Se adjuntan:\n" +
      "1. Ficha de datos de las partes (" + base + ".docx o .pdf)\n" +
      "2. Art. 92 — Decreto de Determinación de los Hechos\n\n" +
      "Sin otro particular, saludo atentamente.";
    return { asunto: asunto, cuerpo: cuerpo, base: base };
  }

  function botonCopiar(id, etiqueta) {
    return '<button class="sec mini" id="' + id + '">' + etiqueta + "</button>";
  }

  document.getElementById("correo").addEventListener("click", function () {
    var r = recolectar();
    var t = textosCorreo(r.datos);

    var enlace = "https://outlook.office.com/mail/deeplink/compose" +
      "?to=" + encodeURIComponent(DESTINO) +
      "&subject=" + encodeURIComponent(t.asunto) +
      "&body=" + encodeURIComponent(t.cuerpo);

    window.open(enlace, "_blank", "noopener");

    mostrar(
      '<div class="listo"><strong>Se abre la redacción en Outlook web</strong>' +
        "Con destinatario, asunto y cuerpo ya escritos.</div>" +
      '<div class="aviso"><strong>Dos cosas antes de enviar</strong>' +
        "1. Cambiar el <strong>De:</strong> a " + esc(REMITENTE) + "<br>" +
        "2. Adjuntar la ficha <strong>" + esc(t.base) + ".docx</strong> o <strong>" +
        esc(t.base) + ".pdf</strong> y el <strong>art. 92</strong>" +
        (estado.art92 ? " (" + esc(estado.art92.name) + ")" : "") + "<br><br>" +
        "Los adjuntos van a mano: ninguna página web puede agregarlos por seguridad del navegador." +
      "</div>" +
      '<div class="botonera">' +
        botonCopiar("copAsunto", "Copiar asunto") +
        botonCopiar("copCuerpo", "Copiar cuerpo") +
        botonCopiar("copMailto", "Abrir en el correo de escritorio") +
      "</div>" +
      avisosPendientes(r, true));

    var copiar = function (id, texto) {
      var b = document.getElementById(id);
      if (!b) return;
      b.addEventListener("click", function () {
        var previo = b.textContent;
        navigator.clipboard.writeText(texto).then(function () {
          b.textContent = "Copiado";
          window.setTimeout(function () { b.textContent = previo; }, 1600);
        });
      });
    };
    copiar("copAsunto", t.asunto);
    copiar("copCuerpo", t.cuerpo);

    var bm = document.getElementById("copMailto");
    if (bm) {
      bm.addEventListener("click", function () {
        window.location.href = "mailto:" + DESTINO +
          "?subject=" + encodeURIComponent(t.asunto) +
          "&body=" + encodeURIComponent(t.cuerpo);
      });
    }
  });

  document.getElementById("limpiar").addEventListener("click", function () {
    if (!window.confirm("¿Vaciar todo el formulario? Se pierde lo cargado.")) return;
    Array.prototype.forEach.call(document.querySelectorAll("input, select, textarea"), function (el) {
      if (el.type !== "file") el.value = ""; else el.value = "";
    });
    estado = { denunciantes: [], denunciados: [], art92: null, art92ok: false };
    pintarPartes("denunciantes"); pintarPartes("denunciados");
    document.getElementById("estadoArt92").innerHTML = "";
    mostrar("");
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-agregar]"), function (b) {
    b.addEventListener("click", function () {
      estado[b.dataset.agregar].push(nuevaParte());
      pintarPartes(b.dataset.agregar);
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-pegar]"), function (b) {
    b.addEventListener("click", function () { pegarListado(b.dataset.pegar); });
  });

  estado.denunciantes.push(nuevaParte());
  estado.denunciados.push(nuevaParte());
  pintarPartes("denunciantes");
  pintarPartes("denunciados");

  /* ---------------- constructor de la ficha ---------------- */
})();
