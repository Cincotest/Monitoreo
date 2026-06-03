export default {
  async fetch(request) {

    const sheetId =
    "1HoTvHDNeP7sJAVUyy4wjug43WtHLYai1DM_ZS_gYmdU";

    const csvUrl =
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

    const url =
    new URL(request.url);

    /****************************************
     API INTERNA
    ****************************************/

    if(url.pathname === "/api/clientes"){

        const response =
        await fetch(csvUrl);

        const csv =
        await response.text();

        const filas =
        csv.trim().split("\n");

        const clientes = [];

        for(let i=1;i<filas.length;i++){

            const c =
            filas[i]
            .split(",");

            if(c.length < 5)
                continue;

clientes.push({
    cliente:
        c[0].replaceAll('"','').trim(),

    conector:
        c[1].replaceAll('"','').trim(),

    // c[2] es "Fecha Actual" — la saltamos

    fecha:
        c[3].replaceAll('"','').trim(),   // ← era c[2], ahora c[3]

    url:
        c[4].replaceAll('"','').trim(),   // ← era c[3], ahora c[4]

    telefono:
        c[5].replaceAll('"','').trim()    // ← era c[4], ahora c[5]
    });
        }

        return Response.json(
            clientes
        );

    }

    /****************************************
     FRONTEND
    ****************************************/

    const html = `
<!DOCTYPE html>

<html lang="es">

<head>

<meta charset="UTF-8">

<meta
name="viewport"
content="width=device-width,initial-scale=1.0">

<title>
Monitor Renovaciones
</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{

    background:#f5f7fb;

    font-family:
    Arial,
    sans-serif;

    padding:30px;

}

h1{

    color:#1f2937;

    margin-bottom:20px;

}

.buscador{

    width:100%;

    padding:14px;

    border-radius:10px;

    border:1px solid #ddd;

    margin-bottom:25px;

}

.grid{

    display:grid;

    grid-template-columns:
    repeat(
        auto-fill,
        minmax(320px,1fr)
    );

    gap:20px;

}

.card{

    background:white;

    border-radius:15px;

    padding:20px;

    box-shadow:
    0 10px 25px
    rgba(0,0,0,.08);

    transition:.3s;

}

.card:hover{

    transform:
    translateY(-5px);

}

.card h3{

    margin-bottom:10px;

}

.card p{

    margin:8px 0;

}

.critico{

    border-left:
    8px solid #ff1744;

    background:
    linear-gradient(
    135deg,
    #fff3e0,
    #ffe0b2
    );

}

.proximo{

    border-left:
    8px solid #fbc02d;

    background:
    linear-gradient(
    135deg,
    #fffde7,
    #fff59d
    );

}

.normal{

    border-left:
    8px solid #4caf50;

}

.badge{

    display:inline-block;

    padding:
    6px 12px;

    border-radius:20px;

    font-size:12px;

    font-weight:bold;

}

.badge-critico{

    background:#ff1744;

    color:white;

}

.badge-proximo{

    background:#fbc02d;

}

.badge-normal{

    background:#4caf50;

    color:white;

}

.link{

    display:inline-block;

    margin-top:10px;

    text-decoration:none;

    color:#1565c0;

    font-weight:bold;

}

.tooltip{

    position:relative;

    cursor:pointer;

}

.tooltip .tooltiptext{

    visibility:hidden;

    width:140px;

    background:#333;

    color:#fff;

    text-align:center;

    border-radius:8px;

    padding:8px;

    position:absolute;

    bottom:130%;

    left:50%;

    margin-left:-70px;

}

.tooltip:hover .tooltiptext{

    visibility:visible;

}

</style>

</head>

<body>

<h1>
📅 Monitor de Renovaciones
</h1>

<input
class="buscador"
id="buscar"
placeholder="Buscar cliente...">

<div
class="grid"
id="contenedor">
</div>

<script>
function calcularDias(fecha){

    const partes =
    fecha.split("/");

    if(partes.length !== 3)
        return 999;

    const vencimiento =
    new Date(
        Number(partes[2]),
        Number(partes[1]) - 1,
        Number(partes[0])
    );

    const hoy =
    new Date();

    hoy.setHours(0,0,0,0);

    return Math.ceil(
        (vencimiento - hoy) /
        (1000 * 60 * 60 * 24)
    );

}

function obtenerEstado(dias){

    if(dias <= 2){

        return {
            clase:"critico",
            badge:"badge-critico",
            texto:"🟠 Vencido"
        };

    }

    if(dias <= 7){

        return {
            clase:"proximo",
            badge:"badge-proximo",
            texto:"🟡 Próximo"
        };

    }

    return {
        clase:"normal",
        badge:"badge-normal",
        texto:"🟢 Activo"
    };

}

function renderizar(clientes) {
    const contenedor = document.getElementById("contenedor");
    let html = "";
 
    clientes.forEach(cliente => {
      const dias   = calcularDias(cliente.fecha);
      const estado = obtenerEstado(dias);
 
      html += \`
        <div class="\${estado.clase} card">
          <h3>\${cliente.cliente}</h3>
          <p><strong>Conector:</strong> \${cliente.conector}</p>
          <p>
            <span class="badge \${estado.badge} tooltip">
              \${estado.texto}
              <span class="tooltiptext">Vence en \${dias} días</span>
            </span>
          </p>
          <p><strong>Fecha:</strong> \${cliente.fecha}</p>
          <p><strong>Tel:</strong> \${cliente.telefono}</p>
          <a class="link" href="\${cliente.url}" target="_blank">Abrir instancia</a>
        </div>
      \`;
    });

contenedor.innerHTML = html;

}

let todos = [];

async function cargarDatos(){

    const response =
    await fetch(
        "/api/clientes"
    );

    todos =
    await response.json();

    renderizar(
        todos
    );

}

document
.getElementById(
"buscar"
)
.addEventListener(
"input",
function(){

    const texto =
    this.value
    .toLowerCase();

    const filtrados =
    todos.filter(c =>

        c.cliente
        .toLowerCase()
        .includes(texto)

    );

    renderizar(
        filtrados
    );

});

 cargarDatos();
 
\<\/script>
</body>
</html>\`;
 
    return new Response(html, {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
 
  }
};
