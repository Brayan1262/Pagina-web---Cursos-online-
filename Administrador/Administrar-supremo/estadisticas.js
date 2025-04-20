let currentData = 'Cuentas creadas'; // Guardar el tipo de datos actual para actualizar el gráfico

// Crear instancia del gráfico
const ctx = document.getElementById('myChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: '',
            data: [],
            backgroundColor: 'rgba(0, 123, 255, 0.7)', // Color celeste
            borderColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Función para actualizar el gráfico
async function updateChart(dataType) {
    currentData = dataType; // Actualizar el tipo de datos actual
    const filter = document.getElementById('filterSelect').value.toLowerCase(); // Obtener el filtro seleccionado
    document.getElementById('chartType').textContent = dataType; // Actualizar el título del gráfico

    let endpoint = '';

    // Asignar el endpoint basado en el tipo de estadística
    switch (dataType) {
        case 'Cuentas creadas':
            endpoint = `/cuentas-creadas/${filter}`;
            break;
        case 'Docentes registrados':
            endpoint = `/docentes-registrados/${filter}`;
            break;
        case 'Estudiantes con suscripción anual':
            endpoint = `/estudiantes-anuales/${filter}`;
            break;
        case 'Cuentas becadas':
            endpoint = `/cuentas-becadas/${filter}`;
            break;
        case 'Ganancias':
            endpoint = `/ganancias/${filter}`;
            break;
        default:
            console.error('Tipo de estadística no válida');
            return;
    }

    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        // Extraer etiquetas y datos de la respuesta del servidor
        const labels = data.map(item => item.periodo);
        const values = data.map(item => item.cantidad); // Asegurarse de que "cantidad" exista

        // Actualizar los datos del gráfico
        chart.data.labels = labels;
        chart.data.datasets[0].data = values;
        chart.data.datasets[0].label = dataType;
        chart.update();

        // Calcular y mostrar el total
        const total = values.reduce((sum, val) => sum + val, 0);
        document.getElementById('chartTotal').textContent = 'Total: ' + total;
    } catch (error) {
        console.error('Error al actualizar el gráfico:', error);
    }
}

// Cargar el gráfico inicialmente con "Cuentas creadas"
updateChart(currentData);

//Grafico de planes de usuario
let myPieChart;

async function updateDiagram() {
  const ctp = document.getElementById("myPieChart");
  try {
    const response = await fetch("/porcentajes-plansuser");
    const data = await response.json();

    // Verifica si la respuesta contiene un error
    if (!data || data.success === false) {
      console.error(
        "Error al obtener datos:",
        data.message || "Respuesta inválida"
      );
      return;
    }

    const databd = [
      data.total_plan_basico,
      data.total_plan_medio,
      data.total_plan_experto,
    ];

    console.log("Datos para el gráfico:", databd);

    // Verifica que databd tenga la estructura correcta
    if (!databd || databd.length !== 3) {
      console.error("Datos inválidos para el gráfico:", databd);
      return;
    }

    // Verifica si myPieChart está definido y tiene datasets
    if (myPieChart && myPieChart.data && myPieChart.data.datasets) {
      myPieChart.data.datasets[0].data = databd;
      myPieChart.update();
    } else {
      console.warn(
        "myPieChart no está definido o no tiene datasets. Creando un nuevo gráfico."
      );
      myPieChart = new Chart(ctp, {
        type: "pie",
        data: {
          labels: ["Basico", "Medio", "Experto"],
          datasets: [
            {
              label: "Planes",
              data: [databd[0], databd[1], databd[2]],
              backgroundColor: [
                "rgb(255,99,132)",
                "rgb(64,162,235)",
                "rgb(255,205,80)",
              ],
              hoverOffset: 4,
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error("Error al actualizar el gráfico:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateDiagram();
});

//Grafico de planes de usuario
let myPieChart2;

async function updateDiagram2() {
  const ctp = document.getElementById("myPieChart2");
  try {
    const response = await fetch("/user-becado");
    const data = await response.json();

    // Verifica si la respuesta contiene un error
    if (!data || data.success === false) {
      console.error(
        "Error al obtener datos:",
        data.message || "Respuesta inválida"
      );
      return;
    }

    const databd = [data.total_becados, data.total_no_becados];

    console.log("Datos para el gráfico:", databd);

    // Verifica que databd tenga la estructura correcta
    if (!databd || databd.length !== 2) {
      console.error("Datos inválidos para el gráfico:", databd);
      return;
    }

    // Verifica si myPieChart está definido y tiene datasets
    if (myPieChart2 && myPieChart2.data && myPieChart2.data.datasets) {
      myPieChart2.data.datasets[0].data = databd;
      myPieChart2.update();
    } else {
      console.warn(
        "myPieChart2 no está definido o no tiene datasets. Creando un nuevo gráfico."
      );
      myPieChart2 = new Chart(ctp, {
        type: "pie",
        data: {
          labels: ["Becado", "No becado"],
          datasets: [
            {
              label: "Usuarios",
              data: [databd[0], databd[1]],
              backgroundColor: ["rgb(255,99,132)", "rgb(64,162,235)"],
              hoverOffset: 4,
            },
          ],
        },
      });
    }
  } catch (error) {
    console.error("Error al actualizar el gráfico:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateDiagram2();
});

async function drawLineChart() {
  try {
    // Llamar al endpoint para obtener los datos
    const response = await fetch("http://localhost:3030/pagos-por-dia");
    const result = await response.json();

    if (!result.success) {
      console.error("Error al obtener los datos:", result.message);
      return;
    }

    // Procesar los datos para agruparlos por mes
    const monthlyData = Array(12).fill(0); // Inicializar los meses con 0
    result.data.forEach((item) => {
      const date = new Date(item.fecha); // Convertir la fecha
      const monthIndex = date.getMonth(); // Obtener el índice del mes (0-11)
      monthlyData[monthIndex] += item.monto_total; // Sumar el monto al mes correspondiente
    });

    // Configuración de Chart.js
    const ctx = document.getElementById("myLineChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ],
        datasets: [
          {
            label: "Ingresos Mensuales",
            data: monthlyData,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 2,
            tension: 0, // Curvatura de las líneas
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Monto Total (S/)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Meses",
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error al renderizar el gráfico:", error);
  }
}

// Llamar a la función para dibujar el gráfico al cargar la página
drawLineChart();