document.addEventListener("DOMContentLoaded", function () {
    // Obtener el rol del usuario
    const auth = localStorage.getItem("auth");
    const role = localStorage.getItem("role");

    // Redirigir según el tipo de usuario
    if (auth === "true") {
        if (role === "admin") {
            window.location.href = "dashboard.html"; // Administrador
        } else if (role === "user") {
            window.location.href = "registrar_venta.html"; // Usuario normal
        }
    }

    document.getElementById("loginForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Definir usuarios
        const users = {
            admin: { username: "admin", password: "1234", role: "admin" },
            vendedor: { username: "vendedor", password: "5678", role: "user" }
        };

        // Verificar si el usuario es válido
        if (users[username] && users[username].password === password) {
            localStorage.setItem("auth", "true");
            localStorage.setItem("role", users[username].role);

            if (users[username].role === "admin") {
                window.location.href = "dashboard.html"; // Administrador
            } else {
                window.location.href = "registrar_venta.html"; // Usuario normal
            }
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    });
});
