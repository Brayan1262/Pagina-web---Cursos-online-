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
