document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addSaleForm");
    const tableBody = document.getElementById("salesTableBody");
    let sales = JSON.parse(localStorage.getItem("sales")) || [];
    let deleteHistory = JSON.parse(localStorage.getItem("deleteHistory")) || [];

    renderSales();

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // 📌 Obtener valores del formulario
        const productName = document.getElementById("productName").value.trim();
        const productQuantity = parseInt(document.getElementById("productQuantity").value);
        const productPrice = parseFloat(document.getElementById("productPrice").value).toFixed(2);
        const saleDate = new Date();
        const formattedDate = saleDate.toLocaleDateString();
        const formattedTime = saleDate.toLocaleTimeString();
        const user = "Usuario Actual"; // ⚡ Cambiar si hay un sistema de usuarios

        // 📌 Validaciones
        if (!productName || productQuantity <= 0 || isNaN(productPrice)) {
            alert("⚠️ Por favor, ingrese valores válidos.");
            return;
        }

        // 🔥 Crear objeto de venta con ID único
        const sale = {
            id: Date.now(), // ✅ ID único
            productName,
            productQuantity,
            productPrice,
            formattedDate,
            formattedTime,
            user
        };

        // 📌 Agregar y guardar
        sales.push(sale);
        localStorage.setItem("sales", JSON.stringify(sales));

        renderSales();
        form.reset();
    });

    function renderSales() {
        tableBody.innerHTML = "";

        // 🔴 Obtener IDs de productos eliminados
        let deletedProductIds = new Set(deleteHistory.map(record => record.id));

        sales.forEach((sale, index) => {
            const row = document.createElement("tr");

            // 🔥 Resaltar solo los eliminados
            if (deletedProductIds.has(sale.id)) {
                row.style.backgroundColor = "#ffcccc"; // Rojo claro
                row.style.fontWeight = "bold"; 
            }

            row.innerHTML = `
                <td>${sale.id}</td>  
                <td>${sale.productName}</td>
                <td>${sale.productQuantity}</td>
                <td>$${sale.productPrice}</td>
                <td>${sale.formattedDate}</td>
                <td>${sale.formattedTime}</td>
                <td>${sale.user}</td>
                <td><button class="delete-btn" onclick="deleteSale(${sale.id})">❌</button></td>
            `;
            tableBody.appendChild(row);
        });
    }

    window.deleteSale = function (id) {
        let saleIndex = sales.findIndex(sale => sale.id === id);
        if (saleIndex !== -1) {
            let deletedSale = sales[saleIndex];

            if (confirm(`¿Seguro que deseas eliminar la venta de ${deletedSale.productName}?`)) {
                // 🔥 Guardar en historial de eliminaciones
                let deletedRecord = {
                    id: deletedSale.id, // ✅ Guardar ID correcto
                    productName: deletedSale.productName,
                    productQuantity: deletedSale.productQuantity,
                    productPrice: deletedSale.productPrice,
                    formattedDate: deletedSale.formattedDate,
                    formattedTime: deletedSale.formattedTime,
                    user: deletedSale.user,
                    role: "Administrador"
                };

                deleteHistory.push(deletedRecord);
                localStorage.setItem("deleteHistory", JSON.stringify(deleteHistory));

                // 🔴 Actualizar `sales` quitando la venta eliminada
                sales = sales.filter(sale => sale.id !== id);
                localStorage.setItem("sales", JSON.stringify(sales));

                renderSales();
                alert(`✅ Venta de ${deletedSale.productName} eliminada correctamente.`);
            }
        } else {
            alert("⚠️ No se encontró la venta.");
        }
    };
});
