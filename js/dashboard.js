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
                <td><button class="delete-sale" data-id="${sale.product}">❌ Eliminar</button></td>
            `;
            salesTableBody.appendChild(row);
        });

        totalEarnings = salesData.reduce((sum, sale) => sum + sale.totalPrice, 0);
        totalProducts = salesData.reduce((sum, sale) => sum + sale.quantity, 0);
        totalEarningsElem.textContent = `$${totalEarnings.toFixed(2)}`;
        totalProductsElem.textContent = totalProducts;
    }

    document.getElementById("addSaleForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const productName = document.getElementById("productName").value;
        const productQuantity = parseInt(document.getElementById("productQuantity").value);
        const productPrice = parseFloat(document.getElementById("productPrice").value);

        if (!productName || isNaN(productPrice) || productPrice <= 0 || isNaN(productQuantity) || productQuantity <= 0) {
            alert("Por favor, ingresa valores válidos.");
            return;
        }

        const confirmation = confirm(`¿Deseas agregar la venta de ${productQuantity} ${productName} a ${productPrice }  PESOS💵 ?`);
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
        alert(`✅ Venta de ${productQuantity} ${productName} registrado correctamente👌❤️`);
    });

    renderTable();
    updateCharts();
});
