paypal.Buttons({
    style: {
        color: 'blue',
        shape: 'pill',
        label: 'pay',
    },
    createOrder: function (data, actions) {
        // Recuperar los detalles del plan desde localStorage
        const planDescription = localStorage.getItem('planDescription');
        const planPrice = parseFloat(localStorage.getItem('planPrice'));

        // Verificar que el plan existe y el precio es válido
        if (!planDescription || isNaN(planPrice)) {
            alert("No se ha encontrado el plan o el precio es inválido.");
            return;
        }

        // Crear la unidad de compra para PayPal
        let purchaseUnit = {
            description: planDescription, // Descripción del plan
            amount: {
                currency_code: "USD", // Asegúrate de que la moneda sea válida
                value: planPrice.toFixed(2), // Asegurarse de que el valor esté formateado correctamente
            },
        };

        // Crear la orden con el detalle del plan
        return actions.order.create({
            purchase_units: [purchaseUnit], // Solo un plan en esta orden
            intent: 'CAPTURE', // Asegúrate de que la intención sea correcta
            payer: {
                payment_method: 'paypal',
            },
            application_context: {
                shipping_preference: 'NO_SHIPPING', // Depende de tu caso
            }
        });
    },
    onApprove: function (data, actions) {
        return actions.order.capture().then(function (detalles) {
            console.log('Detalles de la transacción:', detalles);
    
            // Usar el ID fijo del usuario
            const id = 25; // ID fijo
            const plan = 'basico'; // El plan al que se actualizará el usuario después de pagar
    
            // Enviar solicitud al servidor para actualizar el plan del usuario
            fetch('http://localhost:3030/actualizar-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: id,
                    plan: plan,
                }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Si la actualización fue exitosa, vaciar los detalles del plan y redirigir
                    localStorage.removeItem('planDescription');
                    localStorage.removeItem('planPrice');
                    alert("¡Pago completado exitosamente y plan actualizado!");
                    verificarPago();  // Llamar a la función verificarPago para redirigir al usuario
                } else {
                    alert("Hubo un error al actualizar el plan.");
                }
            })
            .catch(err => {
                console.error("Error al enviar la solicitud de actualización de plan:", err);
            });
        });
    },    
    onCancel: function (data) {
        console.log('Pago cancelado:', data);
        alert("El pago ha sido cancelado.");
    }
}).render('#paypal-button-container'); // Este es el contenedor donde se renderiza el botón de PayPal


// Función para verificar el pago después de completar la transacción
function verificarPago() {
    // Aquí puedes agregar más lógica para verificar si el pago fue exitoso usando PayPal u otro método
    const pagoExitoso = true;  // Esto puede ser reemplazado por una verificación real

    if (pagoExitoso) {
        // Si el pago fue exitoso, redirigir al usuario a la página principal (interfaz.html)
        window.location.href = '../InterfazUsuario/interfaz.html';  // Redirige a la pantalla principal
    } else {
        // Si el pago no fue exitoso, mostrar un mensaje o redirigir al usuario a la página de pago
        alert('Hubo un problema con tu pago, por favor intenta de nuevo.');
    }
}
