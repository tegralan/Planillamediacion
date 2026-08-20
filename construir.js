/* Construye la ficha .docx desde cero. Se usa igual en Node y en el navegador. */

function construirFicha(JSZipRef, datos, membreteBytes) {
  var esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };

  var run = function (t, o) {
    o = o || {};
    return '<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>' +
      (o.b ? "<w:b/>" : "") + (o.i ? "<w:i/>" : "") +
      '<w:sz w:val="' + (o.sz || 20) + '"/>' +
      (o.color ? '<w:color w:val="' + o.color + '"/>' : "") +
      '</w:rPr><w:t xml:space="preserve">' + esc(t) + "</w:t></w:r>";
  };

  var parrafo = function (contenido, o) {
    o = o || {};
    var pr = "<w:pPr>";
    if (o.align) pr += '<w:jc w:val="' + o.align + '"/>';
    pr += '<w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after || 80) + '"/>';
    if (o.borde) {
      pr += '<w:pBdr><w:bottom w:val="single" w:sz="' + (o.bordeSz || 6) +
            '" w:color="' + (o.bordeColor || "1F5F5B") + '"/></w:pBdr>';
    }
    pr += "</w:pPr>";
    return "<w:p>" + pr + contenido + "</w:p>";
  };

  var seccion = function (t) {
    return parrafo(run(t.toUpperCase(), { b: true, sz: 19, color: "1F5F5B" }),
                   { before: 250, after: 100, borde: true });
  };

  var nota = function (t) {
    return parrafo(run(t, { i: true, sz: 17, color: "595959" }), { before: 70, after: 70 });
  };

  var CELDA_BORDES =
    '<w:tcBorders>' +
    '<w:top w:val="single" w:sz="4" w:color="BFBFBF"/>' +
    '<w:left w:val="single" w:sz="4" w:color="BFBFBF"/>' +
    '<w:bottom w:val="single" w:sz="4" w:color="BFBFBF"/>' +
    '<w:right w:val="single" w:sz="4" w:color="BFBFBF"/></w:tcBorders>' +
    '<w:tcMar><w:top w:w="70" w:type="dxa"/><w:left w:w="110" w:type="dxa"/>' +
    '<w:bottom w:w="70" w:type="dxa"/><w:right w:w="110" w:type="dxa"/></w:tcMar>';

  var tabla = function (filas) {
    var trs = filas.map(function (f) {
      return "<w:tr>" +
        '<w:tc><w:tcPr><w:tcW w:w="3400" w:type="dxa"/>' +
        '<w:shd w:val="clear" w:fill="F2F2F2"/>' + CELDA_BORDES + "</w:tcPr>" +
        parrafo(run(f[0], { b: true })) + "</w:tc>" +
        '<w:tc><w:tcPr><w:tcW w:w="5960" w:type="dxa"/>' + CELDA_BORDES + "</w:tcPr>" +
        parrafo(run(f[1] || "")) + "</w:tc></w:tr>";
    }).join("");

    return '<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/><w:tblLayout w:type="fixed"/></w:tblPr>' +
      '<w:tblGrid><w:gridCol w:w="3400"/><w:gridCol w:w="5960"/></w:tblGrid>' + trs + "</w:tbl>";
  };

  var cuerpo = "";

  // ---- membrete ----
  if (membreteBytes) {
    cuerpo += '<w:p><w:pPr><w:spacing w:after="60"/></w:pPr><w:r><w:drawing>' +
      '<wp:inline distT="0" distB="0" distL="0" distR="0">' +
      '<wp:extent cx="3076575" cy="457200"/><wp:docPr id="1" name="membrete"/>' +
      '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">' +
      '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
      '<pic:nvPicPr><pic:cNvPr id="1" name="membrete"/><pic:cNvPicPr/></pic:nvPicPr>' +
      '<pic:blipFill><a:blip r:embed="rId10"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
      '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="3076575" cy="457200"/></a:xfrm>' +
      '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>' +
      "</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>";
  }

  cuerpo += parrafo(
    run("\u201CCentro de Mediaci\u00F3n y M\u00E9todos Alternativos de Abordaje y Soluci\u00F3n de Conflictos\u201D",
        { b: true, sz: 21 }),
    { after: 220, borde: true, bordeSz: 10, bordeColor: "16232E" });

  cuerpo += parrafo(
    run("PROTOCOLO DE ACTUACI\u00D3N PARA MEDIACI\u00D3N", { b: true, i: true, sz: 26 }),
    { align: "center", after: 140 });

  cuerpo += parrafo(run(
    "Por el presente, y atento al protocolo de actuaci\u00F3n previsto en la resoluci\u00F3n del CM " +
    "N\u00BA 65/2020 que habilit\u00F3 la tramitaci\u00F3n de las causas de manera remota, y al MEMO " +
    "77-2020 que reglamenta el sistema de la virtualidad en las mediaciones.", { sz: 19 }),
    { align: "both", after: 120 });

  cuerpo += parrafo(run("La ficha con los datos completos de las partes:", { b: true, sz: 19 }),
                    { after: 60 });

  // ---- causa ----
  cuerpo += seccion("Identificaci\u00F3n de la causa");
  cuerpo += tabla([
    ["CUIJ EJE", datos.cuij],
    ["Car\u00E1tula", datos.caratula],
    ["Objeto de autos (DDH)", datos.ddh]
  ]);
  cuerpo += nota("El objeto de autos (DDH) es imprescindible. Debe consignarse el CUIJ de EJE.");

  // ---- partes ----
  var bloqueParte = function (titulo, p) {
    return seccion(titulo) + tabla([
      ["Nombre y apellido", p.nombre],
      ["DNI / Pasaporte u otro", p.doc],
      ["Tel\u00E9fono fijo", p.fijo],
      ["Celular", p.celular],
      ["Correo electr\u00F3nico", p.mail]
    ]);
  };

  datos.denunciantes.forEach(function (p, i) {
    cuerpo += bloqueParte("Parte denunciante " + (i + 1), p);
  });
  datos.denunciados.forEach(function (p, i) {
    cuerpo += bloqueParte("Parte denunciada " + (i + 1), p);
  });
  cuerpo += nota("Los n\u00FAmeros de tel\u00E9fono fijo y/o celulares son imprescindibles.");

  // ---- defensa ----
  cuerpo += seccion("Defensor\u00EDa interviniente o abogado particular");
  cuerpo += tabla([
    ["Defensor\u00EDa / abogado particular", datos.defensa],
    ["Tel\u00E9fono de contacto", datos.defensaTel],
    ["Correo electr\u00F3nico", datos.defensaMail]
  ]);

  // ---- asesoria ----
  cuerpo += seccion("Asesor\u00EDa Tutelar");
  cuerpo += tabla([
    ["Asesor\u00EDa Tutelar de la causa", datos.asesoria],
    ["Tel\u00E9fono de contacto", datos.asesoriaTel]
  ]);
  cuerpo += nota("Se completa si hay personas menores de edad y resulta necesaria su intervenci\u00F3n.");

  // ---- fiscalia ----
  cuerpo += seccion("Contacto de fiscal\u00EDa");
  cuerpo += tabla([
    ["Fiscal\u00EDa interviniente", datos.fiscalia],
    ["Responsable de la causa", datos.fiscaliaResp],
    ["Tel\u00E9fono", datos.fiscaliaTel],
    ["Correo electr\u00F3nico", datos.fiscaliaMail],
    ["Plazo para gestionar la mediaci\u00F3n", datos.plazo],
    ["Modalidad requerida", datos.modalidad]
  ]);
  cuerpo += nota("Modalidad: virtual o presencial. Se indica al solicitar, para evitar reprogramaciones.");

  // ---- conformidad ----
  cuerpo += seccion("Conformidad de las partes");
  cuerpo += parrafo(run(
    "Asimismo, se deber\u00E1 dejar constancia de la voluntad de las partes para realizar " +
    "el proceso de mediaci\u00F3n o conciliaci\u00F3n.", { b: true, i: true }),
    { align: "both", before: 40, after: 100 });

  var confs = [];
  datos.denunciantes.forEach(function (p, i) {
    confs.push(["Conformidad del denunciante " + (i + 1), p.conformidad]);
  });
  datos.denunciados.forEach(function (p, i) {
    confs.push(["Conformidad del denunciado " + (i + 1), p.conformidad]);
  });
  cuerpo += tabla(confs);

  cuerpo += parrafo(run(
    "Remitir a mediaciononline@jusbaires.gob.ar o realizar la actuaci\u00F3n por el sistema EJE, " +
    "seg\u00FAn corresponda.", { sz: 17, color: "595959" }), { before: 260 });

  // ---- documento ----
  var documento =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
    'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">' +
    "<w:body>" + cuerpo +
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>' +
    '<w:pgMar w:top="900" w:right="1080" w:bottom="900" w:left="1080"/></w:sectPr>' +
    "</w:body></w:document>";

  var zip = new JSZipRef();

  zip.file("[Content_Types].xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Default Extension="png" ContentType="image/png"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    "</Types>");

  zip.file("_rels/.rels",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    "</Relationships>");

  var rels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
  if (membreteBytes) {
    rels += '<Relationship Id="rId10" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/membrete.png"/>';
    zip.file("word/media/membrete.png", membreteBytes);
  }
  rels += "</Relationships>";

  zip.file("word/_rels/document.xml.rels", rels);
  zip.file("word/document.xml", documento);

  return zip;
}
