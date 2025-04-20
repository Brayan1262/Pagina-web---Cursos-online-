function loginSubmit(event) {
    event.preventDefault(); // Prevenir el comportamiento predeterminado del formulario

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Guardar los datos en localStorage
                localStorage.setItem('nombrecompleto', data.nombrecompleto);
                localStorage.setItem('correo', data.correo);
                localStorage.setItem('tipo_administrador', data.tipo_administrador);
                localStorage.setItem('foto', data.foto || "null"); // Guardar "null" si no hay foto

                alert(data.message);
                window.location.href = data.redirectUrl;
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error:', error));
}
