document.addEventListener("DOMContentLoaded", function () {
    const monthFilter = document.getElementById("monthFilter");
    const filterReportButton = document.getElementById("filterReport");
    const totalEarningsReportElem = document.getElementById("totalEarningsReport");
    const totalProductsReportElem = document.getElementById("totalProductsReport");
    const barChartCanvas = document.getElementById("barChartReport").getContext("2d");
    const pieChartCanvas = document.getElementById("pieChartReport").getContext("2d");
    const exportPDFButton = document.getElementById("exportPDF");

    let salesData = JSON.parse(localStorage.getItem("salesData")) || [];
    let barChart, pieChart;

    function filterDataByMonth(month) {
        return salesData.filter(sale => sale.date.startsWith(month)); // Filtra por YYYY-MM
    }

    function updateReport(month) {
        const filteredData = filterDataByMonth(month);
        if (filteredData.length === 0) {
            alert("No hay datos para este mes.");
            totalEarningsReportElem.textContent = `$0.00`;
            totalProductsReportElem.textContent = `0`;
            return;
        }

        const totalEarnings = filteredData.reduce((sum, sale) => sum + sale.totalPrice, 0);
        const totalProducts = filteredData.reduce((sum, sale) => sum + sale.quantity, 0);
        
        totalEarningsReportElem.textContent = `$${totalEarnings.toFixed(2)}`;
        totalProductsReportElem.textContent = totalProducts;
        
        const productNames = [...new Set(filteredData.map(sale => sale.product))];
        const productTotals = productNames.map(name => {
            return filteredData.filter(sale => sale.product === name)
                               .reduce((sum, sale) => sum + sale.totalPrice, 0);
        });

        if (barChart) barChart.destroy();
        if (pieChart) pieChart.destroy();

        barChart = new Chart(barChartCanvas, {
            type: "bar",
            data: {
                labels: productNames,
                datasets: [{
                    label: "Total Vendido ($)",
                    data: productTotals,
                    backgroundColor: "rgba(75, 192, 192, 0.7)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                }]
            }
        });

        pieChart = new Chart(pieChartCanvas, {
            type: "pie",
            data: {
                labels: productNames,
                datasets: [{
                    data: productTotals,
                    backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"]
                }]
            }
        });

        alert("✅ Reporte generado con éxito.");
    }

    filterReportButton.addEventListener("click", function () {
        const selectedMonth = monthFilter.value;
        if (selectedMonth) {
            updateReport(selectedMonth);
        } else {
            alert("Selecciona un mes válido");
        }
    });

    // Funcionalidad para exportar el reporte a PDF
    exportPDFButton.addEventListener("click", function () {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        pdf.setFontSize(16);
        pdf.text("Reporte Mensual de Ventas", 10, 10);

        const month = monthFilter.value;
        pdf.setFontSize(12);
        pdf.text(`Mes seleccionado: ${month}`, 10, 20);

        const totalEarnings = totalEarningsReportElem.textContent;
        const totalProducts = totalProductsReportElem.textContent;

        pdf.text(`Total Vendido: ${totalEarnings}`, 10, 30);
        pdf.text(`Total Productos Vendidos: ${totalProducts}`, 10, 40);

        // Capturar las gráficas con html2canvas
        html2canvas(document.getElementById("barChartReport")).then(canvas => {
            const imgData = canvas.toDataURL("image/png");
            pdf.addImage(imgData, "PNG", 10, 50, 180, 80);

            html2canvas(document.getElementById("pieChartReport")).then(canvas2 => {
                const imgData2 = canvas2.toDataURL("image/png");
                pdf.addImage(imgData2, "PNG", 10, 140, 100, 100);

                pdf.save(`Reporte_Ventas_${month}.pdf`);
            });
        });
    });
});
