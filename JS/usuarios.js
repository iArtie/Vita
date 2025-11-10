document.addEventListener('DOMContentLoaded', () => {

    const formRegistro = document.getElementById('registroForm');
    if (formRegistro) {
        formRegistro.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(formRegistro);

            fetch('/usuarios/registrar.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                const resultado = document.getElementById('resultado');
                
                if (data.success) {
                    resultado.textContent = "✅" + data.message;
                    resultado.style.color = "green";
                    formRegistro.reset();
                } else {
                    resultado.textContent = "❌" + data.message;
                    resultado.style.color = "red";
                }
            })
            .catch(error => {
                document.getElementById('resultado').textContent = "Error: " + error;
                document.getElementById('resultado').style.color = "red";
            });
        });
    }

});
