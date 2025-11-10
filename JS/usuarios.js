document.addEventListener('DOMContentLoaded', () => {

    // Registro de usuario
    const formRegistro = document.getElementById('registroForm');
    if (formRegistro) {
        formRegistro.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(formRegistro);

            fetch('/usuarios/registrar.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                const resultado = document.getElementById('resultado');

                if (data.toLowerCase().includes('duplicate entry')) {
                    if (data.toLowerCase().includes('username')) {
                        resultado.textContent = "El username ya está registrado.";
                    } else if (data.toLowerCase().includes('email')) {
                        resultado.textContent = "El correo ya está registrado.";
                    } else {
                        resultado.textContent = "Error de duplicado en la base de datos.";
                    }
                } else {
                    resultado.textContent = data;
                    formRegistro.reset();
                }
            })
            .catch(error => {
                document.getElementById('resultado').textContent = "Error: " + error;
            });
        });
    }

});
