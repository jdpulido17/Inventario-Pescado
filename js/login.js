document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Evita el envío del formulario

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Credenciales simuladas (puedes cambiarlas o conectar con una base de datos)
        const validUser = "admin";
        const validPassword = "1234";

        if (username === validUser && password === validPassword) {
            // Guardar sesión en localStorage
            localStorage.setItem("loggedIn", "true");

            // Redirigir al dashboard
            window.location.href = "dashboard.html";
        } else {
            alert("⚠️ Usuario o contraseña incorrectos.");
        }
    });

    // Mostrar/ocultar contraseña
    document.querySelector(".toggle-password").addEventListener("click", function () {
        const passwordField = document.getElementById("password");
        if (passwordField.type === "password") {
            passwordField.type = "text";
            this.textContent = "🙈"; // Icono de ocultar
        } else {
            passwordField.type = "password";
            this.textContent = "👁️"; // Icono de mostrar
        }
    });
});
