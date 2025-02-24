document.addEventListener("DOMContentLoaded", function () {
    let sales = JSON.parse(localStorage.getItem("sales")) || [];
    let deleteHistory = JSON.parse(localStorage.getItem("deleteHistory")) || [];

    const totalEarningsElement = document.getElementById("totalEarnings");
    const totalProductsElement = document.getElementById("totalProducts");
    const salesTableBody = document.getElementById("salesTableBody");
    const deleteHistoryBody = document.getElementById("deleteHistoryBody");

    let barChart = null;
    let pieChart = null;

    function updateDashboard() {
        if (!totalEarningsElement || !totalProductsElement || !salesTableBody) return;

        let totalEarnings = 0;
        let totalProducts = 0;
        let productSales = {};  
        let productRevenue = {};  

        salesTableBody.innerHTML = "";

        let deletedIds = new Set(deleteHistory.map(record => record.id));
        let allSales = [...sales, ...deleteHistory];

        allSales.forEach((sale) => {
            if (!sale) return;

            const { id, productName, productQuantity, productPrice, formattedDate, formattedTime, user } = sale;
            const totalPrice = parseFloat(productPrice) * productQuantity;

            if (!deletedIds.has(id)) {
                totalEarnings += totalPrice;
                totalProducts += productQuantity;
                productSales[productName] = (productSales[productName] || 0) + productQuantity;
                productRevenue[productName] = (productRevenue[productName] || 0) + totalPrice;
            }

            const row = document.createElement("tr");
            if (deletedIds.has(id)) {
                row.style.backgroundColor = "#ffcccc";
                row.style.fontWeight = "bold";
            }

            row.innerHTML = `
                <td>${id}</td>
                <td>${productName}</td>
                <td>${productQuantity}</td>
                <td>$${productPrice}</td>
                <td>${formattedDate}</td>
                <td>${formattedTime || "-"}</td>
                <td>${user || "Desconocido"}</td>
                <td>
                    ${deletedIds.has(id) 
                        ? `<button class="restore-btn" onclick="restoreSale(${id})">♻️ Recuperar</button>` 
                        : `<button class="delete-btn" onclick="deleteSale(${id})">❌ Eliminar</button>`}
                </td>
            `;
            salesTableBody.appendChild(row);
        });

        totalEarningsElement.textContent = `$${totalEarnings.toFixed(2)}`;
        totalProductsElement.textContent = totalProducts;

        renderDeleteHistory();
        renderCharts(productSales, productRevenue);
    }

    function renderDeleteHistory() {
        deleteHistoryBody.innerHTML = "";

        if (deleteHistory.length === 0) {
            deleteHistoryBody.innerHTML = "<tr><td colspan='7'>No hay eliminaciones registradas.</td></tr>";
            return;
        }

        deleteHistory.forEach((record) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${record.id}</td>
                <td>${record.productName || "Desconocido"}</td>
                <td>${record.productQuantity || "N/A"}</td>
                <td>${record.formattedDate || "N/A"}</td>
                <td>${record.formattedTime || "N/A"}</td>
                <td>${record.user || "Desconocido"}</td>
            `;
            deleteHistoryBody.appendChild(row);
        });
    }

    function renderCharts(productSales, productRevenue) {
        if (!document.getElementById("barChart") || !document.getElementById("pieChart")) return;

        const productNames = Object.keys(productRevenue);
        const productPrices = Object.values(productRevenue);
        const productQuantities = Object.values(productSales);

        if (productNames.length === 0) return; 

        function getRandomColor() {
            return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
        }

        const colors = productNames.map(() => getRandomColor());

        if (barChart) barChart.destroy();
        if (pieChart) pieChart.destroy();

        const barCtx = document.getElementById("barChart").getContext("2d");
        barChart = new Chart(barCtx, {
            type: "bar",
            data: {
                labels: productNames,
                datasets: [{
                    label: "Ingresos por producto ($)",
                    data: productPrices,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace("rgb", "rgba").replace(")", ", 1)")),
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        enabled: true,
                        callbacks: {
                            label: function (tooltipItem) {
                                return `$${tooltipItem.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        title: { display: true, text: "Ingresos ($)" }
                    }
                }
            }
        });

        const pieCtx = document.getElementById("pieChart").getContext("2d");
        pieChart = new Chart(pieCtx, {
            type: "pie",
            data: {
                labels: productNames,
                datasets: [{
                    data: productQuantities,
                    backgroundColor: colors,
                    borderColor: "#fff",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: { enabled: true }
                }
            }
        });

        document.getElementById("barChart").style.maxWidth = "1000px";
        document.getElementById("barChart").style.maxHeight = "300px";
        document.getElementById("pieChart").style.maxWidth = "300px";
        document.getElementById("pieChart").style.maxHeight = "300px";
    }

    window.deleteSale = function (id) {
        let saleIndex = sales.findIndex(sale => sale.id === id);
        if (saleIndex !== -1) {
            let deletedSale = sales[saleIndex];
            deleteHistory.push(deletedSale);
            sales.splice(saleIndex, 1);
            localStorage.setItem("sales", JSON.stringify(sales));
            localStorage.setItem("deleteHistory", JSON.stringify(deleteHistory));
            updateDashboard();
        }
    };

    window.restoreSale = function (id) {
        let recordIndex = deleteHistory.findIndex(record => record.id === id);
        if (recordIndex !== -1) {
            let restoredSale = deleteHistory[recordIndex];
            sales.push(restoredSale);
            deleteHistory.splice(recordIndex, 1);
            localStorage.setItem("sales", JSON.stringify(sales));
            localStorage.setItem("deleteHistory", JSON.stringify(deleteHistory));
            updateDashboard();
        }
    };

    updateDashboard();
});
