const handler = async (event, context) => {
  const request = new URL(event.rawUrl);

  /****************************************
     API PARA TAREAS
    ****************************************/

  if(request.pathname === "/.netlify/functions/api" && request.searchParams.get("path") === "/api/tareas"){
    
    if(event.httpMethod === "GET"){
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "GET /api/tareas - obtiene todas las tareas desde localStorage"
        })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "API de tareas disponible"
      })
    };
  }

  /****************************************
     FRONTEND - TO-DO LIST
    ****************************************/

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Lista de Tareas</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 100%;
      padding: 40px;
    }

    h1 {
      color: #333;
      margin-bottom: 30px;
      text-align: center;
      font-size: 2.5em;
    }

    .input-container {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
    }

    input[type="text"] {
      flex: 1;
      padding: 15px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
      transition: border-color 0.3s;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: #667eea;
    }

    button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 30px;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s;
    }

    button:hover {
      transform: translateY(-2px);
    }

    button:active {
      transform: translateY(0);
    }

    .stats {
      display: flex;
      justify-content: space-around;
      margin-bottom: 30px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 10px;
      text-align: center;
    }

    .stat {
      flex: 1;
    }

    .stat-number {
      font-size: 2em;
      font-weight: bold;
      color: #667eea;
    }

    .stat-label {
      color: #666;
      font-size: 0.9em;
      margin-top: 5px;
    }

    .tareas-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .tarea-item {
      display: flex;
      align-items: center;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 10px;
      margin-bottom: 10px;
      transition: all 0.3s;
    }

    .tarea-item:hover {
      background: #f0f0f0;
      transform: translateX(5px);
    }

    .tarea-item.completada {
      opacity: 0.6;
    }

    .tarea-item.completada .tarea-texto {
      text-decoration: line-through;
      color: #999;
    }

    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      margin-right: 15px;
      cursor: pointer;
    }

    .tarea-texto {
      flex: 1;
      font-size: 16px;
      color: #333;
    }

    .tarea-fecha {
      font-size: 0.8em;
      color: #999;
      margin-right: 15px;
    }

    .btn-eliminar {
      background: #ff6b6b;
      padding: 8px 15px;
      font-size: 14px;
      border-radius: 5px;
    }

    .btn-eliminar:hover {
      background: #ff5252;
    }

    .tareas-vacio {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .tareas-vacio svg {
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .filtros {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      justify-content: center;
    }

    .filtro-btn {
      background: #e0e0e0;
      color: #333;
      padding: 8px 15px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .filtro-btn.activo {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .acciones {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      justify-content: center;
    }

    .btn-limpiar {
      background: #ff9800;
      padding: 10px 20px;
      font-size: 14px;
    }

    .btn-limpiar:hover {
      background: #fb8c00;
    }

    @media (max-width: 600px) {
      .container {
        padding: 20px;
      }

      h1 {
        font-size: 1.8em;
      }

      .input-container {
        flex-direction: column;
      }

      .stats {
        flex-direction: column;
        gap: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>✅ Mi Lista de Tareas</h1>

    <div class="input-container">
      <input 
        type="text" 
        id="inputTarea" 
        placeholder="Escribe una nueva tarea..."
        autocomplete="off"
      >
      <button onclick="agregarTarea()">Agregar</button>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-number" id="totalTareas">0</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat">
        <div class="stat-number" id="completadasTareas">0</div>
        <div class="stat-label">Completadas</div>
      </div>
      <div class="stat">
        <div class="stat-number" id="pendientesTareas">0</div>
        <div class="stat-label">Pendientes</div>
      </div>
    </div>

    <div class="filtros">
      <button class="filtro-btn activo" onclick="filtrar('todas')">Todas</button>
      <button class="filtro-btn" onclick="filtrar('pendientes')">Pendientes</button>
      <button class="filtro-btn" onclick="filtrar('completadas')">Completadas</button>
    </div>

    <div class="tareas-list" id="tareasList"></div>

    <div class="acciones">
      <button class="btn-limpiar" onclick="limpiarCompletadas()">Limpiar completadas</button>
    </div>
  </div>

  <script>
    let tareas = [];
    let filtroActual = 'todas';

    // Cargar tareas del localStorage
    function cargarTareas() {
      const tareasGuardadas = localStorage.getItem('tareas');
      if (tareasGuardadas) {
        tareas = JSON.parse(tareasGuardadas);
      }
      renderizar();
    }

    // Guardar tareas en localStorage
    function guardarTareas() {
      localStorage.setItem('tareas', JSON.stringify(tareas));
    }

    // Agregar nueva tarea
    function agregarTarea() {
      const input = document.getElementById('inputTarea');
      const texto = input.value.trim();

      if (texto === '') {
        alert('Por favor escribe una tarea');
        return;
      }

      const tarea = {
        id: Date.now(),
        texto: texto,
        completada: false,
        fecha: new Date().toLocaleDateString('es-ES')
      };

      tareas.unshift(tarea);
      guardarTareas();
      input.value = '';
      renderizar();
    }

    // Completar/descompletar tarea
    function toggleTarea(id) {
      const tarea = tareas.find(t => t.id === id);
      if (tarea) {
        tarea.completada = !tarea.completada;
        guardarTareas();
        renderizar();
      }
    }

    // Eliminar tarea
    function eliminarTarea(id) {
      tareas = tareas.filter(t => t.id !== id);
      guardarTareas();
      renderizar();
    }

    // Limpiar todas las completadas
    function limpiarCompletadas() {
      if (tareas.some(t => t.completada)) {
        if (confirm('¿Eliminar todas las tareas completadas?')) {
          tareas = tareas.filter(t => !t.completada);
          guardarTareas();
          renderizar();
        }
      }
    }

    // Filtrar tareas
    function filtrar(tipo) {
      filtroActual = tipo;
      document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('activo'));
      event.target.classList.add('activo');
      renderizar();
    }

    // Actualizar estadísticas
    function actualizarStats() {
      const total = tareas.length;
      const completadas = tareas.filter(t => t.completada).length;
      const pendientes = total - completadas;

      document.getElementById('totalTareas').textContent = total;
      document.getElementById('completadasTareas').textContent = completadas;
      document.getElementById('pendientesTareas').textContent = pendientes;
    }

    // Renderizar lista
    function renderizar() {
      const lista = document.getElementById('tareasList');
      let tareasFiltradas = tareas;

      if (filtroActual === 'completadas') {
        tareasFiltradas = tareas.filter(t => t.completada);
      } else if (filtroActual === 'pendientes') {
        tareasFiltradas = tareas.filter(t => !t.completada);
      }

      actualizarStats();

      if (tareasFiltradas.length === 0) {
        lista.innerHTML = \`
          <div class="tareas-vacio">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No hay tareas aquí</p>
          </div>
        \`;
        return;
      }

      lista.innerHTML = tareasFiltradas.map(tarea => \`
        <div class="tarea-item \${tarea.completada ? 'completada' : ''}">
          <input 
            type="checkbox" 
            \${tarea.completada ? 'checked' : ''}
            onchange="toggleTarea(\${tarea.id})"
          >
          <div class="tarea-texto">\${tarea.texto}</div>
          <div class="tarea-fecha">\${tarea.fecha}</div>
          <button class="btn-eliminar" onclick="eliminarTarea(\${tarea.id})">Eliminar</button>
        </div>
      \`).join('');
    }

    // Permitir agregar tarea con Enter
    document.addEventListener('DOMContentLoaded', function() {
      cargarTareas();
      document.getElementById('inputTarea').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          agregarTarea();
        }
      });
    });
  </script>
</body>
</html>
  `;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html;charset=UTF-8" },
    body: html
  };
};

module.exports = { handler };
