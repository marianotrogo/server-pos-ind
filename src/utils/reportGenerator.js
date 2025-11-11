import { jsPDF } from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";

export const generateSalesReportPDF = (sales, summary, { title, from, to }) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title || "Reporte de Ventas", 14, 20);
  doc.setFontSize(10);
  doc.text(`Desde: ${from || "-"}  Hasta: ${to || "-"}`, 14, 28);

  // 🔹 Cards de resumen
  doc.setFillColor(220, 220, 220);
  doc.rect(14, 35, 50, 10, "F");
  doc.text(`Total Ventas: $${summary.totalSales.toFixed(2)}`, 16, 42);

  doc.rect(70, 35, 50, 10, "F");
  doc.text(`Total Productos: ${summary.totalItems}`, 72, 42);

  // 🔹 Totales por forma de pago
  let yPos = 50;
  for (const [type, amount] of Object.entries(summary.totalByPayment)) {
    doc.rect(14, yPos, 50, 10, "F");
    doc.text(`${type}: $${amount.toFixed(2)}`, 16, yPos + 7);
    yPos += 12;
  }

  // 🔹 Tabla resumen ventas
  const tableData = sales.map(s => [
    s.number,
    dayjs(s.createdAt).format("DD/MM/YYYY HH:mm"),
    s.user.name,
    s.client?.name || "-",
    `$${s.total.toFixed(2)}`,
    s.status,
    s.paymentType
  ]);

  doc.autoTable({
    startY: yPos + 10,
    head: [["#", "Fecha", "Usuario", "Cliente", "Total", "Estado", "Pago"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [100, 149, 237], textColor: 255 },
    styles: { fontSize: 8 },
    margin: { left: 14, right: 14 }
  });

  return doc.output("blob"); // se puede enviar como response con res.send
};
