document.addEventListener("DOMContentLoaded", function () {
    let salesData = JSON.parse(localStorage.getItem("salesData")) || [];
    let totalEarnings = salesData.reduce((sum, sale) => sum + sale.totalPrice, 0);
    let totalProducts = salesData.reduce((sum, sale) => sum + sale.quantity, 0);
    let productColors = {};

    const salesTableBody = document.getElementById("salesTableBody");
    const totalEarningsElem = document.getElementById("totalEarnings");
    const totalProductsElem = document.getElementById("totalProducts");

    const barChartCanvas = document.getElementById("barChart").getContext("2d");
    const pieChartCanvas = document.getElementById("pieChart").getContext("2d");

    let barChart, pieChart;

    function assignColor(product) {
        if (!productColors[product]) {
            const color = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`;
            productColors[product] = color;
        }
        return productColors[product];
    }

    function saveToLocalStorage() {
        localStorage.setItem("salesData", JSON.stringify(salesData));
    }

    function updateCharts() {
        const productNames = salesData.map(sale => sale.product);
        const productTotals = salesData.map(sale => sale.totalPrice);
        const productQuantities = salesData.map(sale => sale.quantity);
        const colors = productNames.map(product => assignColor(product));

        if (barChart) barChart.destroy();
        if (pieChart) pieChart.destroy();

        barChart = new Chart(barChartCanvas, {
            type: "bar",
            data: {
                labels: productNames,
                datasets: [{
                    label: "Total Vendido ($)",
                    data: productTotals,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace("0.7", "1")),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                indexAxis: 'y',
                plugins: {
                    legend: { labels: { font: { size: 14 } } },
                    tooltip: { titleFont: { size: 16 }, bodyFont: { size: 14 } }
                },
                scales: {
                    x: { ticks: { font: { size: 12 } } },
                    y: { ticks: { font: { size: 12 } } }
                }
            }
        });

        pieChart = new Chart(pieChartCanvas, {
            type: "pie",
            data: {
                labels: productNames,
                datasets: [{
                    data: productQuantities,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: { labels: { font: { size: 14 } } },
                    tooltip: { titleFont: { size: 16 }, bodyFont: { size: 14 } }
                }
            }
        });
    }

    function deleteSale(index) {
        let deleteHistory = JSON.parse(localStorage.getItem("deleteHistory")) || [];

        if (!salesData[index]) {
            console.error("⚠️ El índice de la venta no es válido.");
            return;
        }

        const deletedSale = salesData[index];

        if (confirm(`¿Seguro que quieres eliminar la venta de ${deletedSale.product}?`)) {
            const now = new Date();
            const deletedRecord = {
                product: deletedSale.product,
                quantity: deletedSale.quantity,
                date: now.toISOString().split("T")[0],
                time: now.toLocaleTimeString(),
                user: "Administrador"
            };

            deleteHistory.push(deletedRecord);
            localStorage.setItem("deleteHistory", JSON.stringify(deleteHistory));

            salesData.splice(index, 1);
            saveToLocalStorage();

            renderTable();
            renderDeleteHistory();
            updateCharts();
        }
    }

    function renderTable() {
        salesTableBody.innerHTML = "";
        salesData.forEach((sale, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${sale.product}</td>
                <td>${sale.quantity}</td>
                <td>$${sale.totalPrice.toFixed(2)}</td>
                <td>${sale.date}</td>
                <td><button class="delete-sale" data-index="${index}">❌ Eliminar</button></td>
            `;
            salesTableBody.appendChild(row);
        });

        document.querySelectorAll(".delete-sale").forEach(button => {
            button.addEventListener("click", function () {
                const index = parseInt(this.getAttribute("data-index"));
                deleteSale(index);
            });
        });

        totalEarnings = salesData.reduce((sum, sale) => sum + sale.totalPrice, 0);
        totalProducts = salesData.reduce((sum, sale) => sum + sale.quantity, 0);
        totalEarningsElem.textContent = `$${totalEarnings.toFixed(2)}`;
        totalProductsElem.textContent = totalProducts;
    }

    function addSale(event) {
        event.preventDefault();
        const productName = document.getElementById("productName").value;
        const productQuantity = parseInt(document.getElementById("productQuantity").value);
        const productPrice = parseFloat(document.getElementById("productPrice").value);

        if (!productName || isNaN(productPrice) || productPrice <= 0 || isNaN(productQuantity) || productQuantity <= 0) {
            alert("Por favor, ingresa valores válidos.");
            return;
        }

        const confirmation = confirm(`¿Deseas agregar la venta de ${productQuantity} ${productName} a ${productPrice} PESOS💵 ?`);

        if (!confirmation) return;

        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];

        const existingProduct = salesData.find(sale => sale.product === productName);

        if (existingProduct) {
            existingProduct.quantity += productQuantity;
            existingProduct.totalPrice += productPrice * productQuantity;
        } else {
            salesData.push({
                product: productName,
                unitPrice: productPrice,
                totalPrice: productPrice * productQuantity,
                quantity: productQuantity,
                date: formattedDate
            });
        }

        saveToLocalStorage();
        renderTable();
        updateCharts();
        document.getElementById("addSaleForm").reset();
        alert(`✅ Venta de ${productQuantity} ${productName} registrada correctamente👌❤️`);
    }

    function renderDeleteHistory() {
        const deleteHistoryBody = document.getElementById("deleteHistoryBody");

        if (!deleteHistoryBody) {
            console.error("⚠️ No se encontró el elemento deleteHistoryBody en el HTML.");
            return;
        }

        let deleteHistory = JSON.parse(localStorage.getItem("deleteHistory")) || [];
        deleteHistoryBody.innerHTML = "";

        if (deleteHistory.length === 0) {
            deleteHistoryBody.innerHTML = "<tr><td colspan='6'>No hay eliminaciones registradas.</td></tr>";
            return;
        }

        deleteHistory.forEach((record, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${record.product}</td>
                <td>${record.quantity}</td>
                <td>${record.date}</td>
                <td>${record.time}</td>
                <td>${record.user}</td>
            `;
            deleteHistoryBody.appendChild(row);
        });
    }
    document.addEventListener("DOMContentLoaded", function () {
        let salesData = JSON.parse(localStorage.getItem("salesData")) || [];
    
        // Función para cerrar sesión
        function logout() {
            localStorage.removeItem("userSession");  // Elimina la sesión guardada
            alert("👋 Sesión cerrada correctamente.");
            window.location.href = "login.html";  // Redirige a la página de inicio de sesión
        }
    
        // Agregar evento al botón de cerrar sesión
        const logoutButton = document.getElementById("logoutButton");
        if (logoutButton) {
            logoutButton.addEventListener("click", logout);
        } else {
            console.warn("⚠️ No se encontró el botón de cerrar sesión en el HTML.");
        }
    });
    
    document.getElementById("addSaleForm").addEventListener("submit", addSale);

    renderTable();
    renderDeleteHistory();
    updateCharts();
});
