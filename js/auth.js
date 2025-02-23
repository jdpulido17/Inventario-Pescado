document.addEventListener("DOMContentLoaded", function () {
    // Si el usuario ya está autenticado, redirigirlo al dashboard
    if (localStorage.getItem("auth") === "true") {
        window.location.href = "dashboard.html";
    }

    document.getElementById("loginForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username === "admin" && password === "1234") {
            localStorage.setItem("auth", "true");
            window.location.href = "dashboard.html";
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    });
});
