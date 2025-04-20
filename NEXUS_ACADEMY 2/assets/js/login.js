document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevenir el envío automático del formulario

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log("Correo ingresado:", email); // Verifica el correo ingresado
    console.log("Contraseña ingresada:", password); // Verifica la contraseña ingresada

    // Realizar la solicitud al endpoint
    fetch("http://localhost:3030/login-usuario", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            usuario1: email,
            password1: password
        })
    })
    .then(response => response.json()) // Procesar la respuesta JSON
    .then(data => {
        console.log("Respuesta del servidor:", data); // Verificar la respuesta del servidor

        if (data.success) {
            // Login exitoso
            console.log("Acceso concedido");
            alert("Inicio de sesión exitoso");
            
            // Redirigir según la edad del usuario
            if (data.rutaDestino) {
                window.location.href = data.rutaDestino; // Redirige a la ruta según la respuesta
            }
        } else {
            // Login fallido
            console.log("Acceso denegado");
            document.getElementById("mensaje").style.display = "block";
            document.getElementById("mensaje").textContent = data.message; // Mostrar mensaje de error
        }
    })
    .catch(error => {
        console.error("Error en la solicitud:", error);
        alert("Hubo un problema con el inicio de sesión. Inténtalo de nuevo.");
    });
});


// Función para capturar los datos del formulario y enviarlos al servidor
function registrarUsuario() {
    // Obtener los valores de los campos del formulario mediante IDs
    const nombre = document.getElementById('nombre').value;
    const apellidos = document.getElementById('apellidos').value;
    const correo = document.getElementById('correoelectronico').value;
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('contrasena').value;
    const fechaNacimiento = document.getElementById('fechanacimiento').value;
    const plan = 'GRATUITO';

    // Crear el objeto de datos que se enviará al servidor
    const data = {
        username: usuario, 
        password: password,
        nombre: nombre,
        apellidos: apellidos,
        genero: null, 
        correo: correo,
        telefono: null, 
        fecha: fechaNacimiento,
        plan: plan, 
        beca: null, 
        ciudad: null, 
        pais: null 
    };

    // Enviar la solicitud POST al servidor
    fetch('http://localhost:3030/agregar-usuario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Registro exitoso. Revisa tu correo para obtener más información.');
            // Limpiar el formulario y ocultar el contenedor de registro
            document.querySelector('.register-form').reset();
            document.getElementById('registerFormContainer').style.display = 'none';
        } else {
            alert('Error al registrar usuario: ' + result.message);
        }
    })
    .catch(error => {
        console.error('Error al realizar la solicitud:', error);
        alert('Ocurrió un error al procesar la solicitud');
    });
}

// Asociar la función al botón de registro
const botonRegistro = document.querySelector('.register-form button[id="registro"]');
botonRegistro.addEventListener('click', function(event) {
    event.preventDefault(); // Evitar el envío por defecto del formulario
    registrarUsuario();
});

