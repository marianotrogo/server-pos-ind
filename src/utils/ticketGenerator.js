import PDFDocument from "pdfkit";
import prisma from "../prismaClient.js";

export async function generateTicketPDF(sale) {
  const settings = await prisma.settings.findFirst();

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [226.77, 2000], // 80mm ancho, alto máximo, la impresora corta sola
      margin: 8,
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // 🏪 Encabezado
    doc.fontSize(10).text(settings?.businessName || "Tienda XYZ", { align: "center" });
    if (settings?.address) doc.fontSize(8).text(settings.address, { align: "center" });
    if (settings?.phone) doc.text(`Tel: ${settings.phone}`, { align: "center" });
    if (settings?.cuit) doc.text(`CUIT: ${settings.cuit}`, { align: "center" });
    doc.moveDown(0.5);

    // 🧾 Venta info
    doc.fontSize(8).text(`Venta: ${sale.number}`);
    doc.text(`Fecha: ${new Date(sale.createdAt).toLocaleString("es-AR")}`);
    doc.text(`Cliente: ${sale.client?.name || "Consumidor Final"}`);
    doc.text(`Vendedor: ${sale.user?.name || "-"}`);
    doc.moveDown(0.5);

    // 📦 Productos
    doc.text("COD | TALLE | CANT | P/U | SUBTOTAL");
    doc.text("----------------------------------------");
    sale.items.forEach((item) => {
      const line = `${(item.code || "").padEnd(5)} | ${item.size || "-"} | ${String(item.qty).padStart(2)} | $${item.price.toFixed(2)} | $${item.subtotal.toFixed(2)}`;
      doc.fontSize(8).text(line);
    });
    doc.text("----------------------------------------");

    // 💰 Totales
    doc.fontSize(9).text(`Subtotal: $${sale.subtotal.toFixed(2)}`, { align: "right" });
    if (sale.discount > 0)
      doc.text(`Descuento: -$${sale.discount.toFixed(2)}`, { align: "right" });
    if (sale.surcharge > 0)
      doc.text(`Recargo: +$${sale.surcharge.toFixed(2)}`, { align: "right" });
    doc.font("Helvetica-Bold").text(`TOTAL: $${sale.total.toFixed(2)}`, { align: "right" });
    doc.font("Helvetica");

    doc.moveDown(0.5);

    // 💳 Pagos
    doc.text("Pagos:", { underline: true });
    if (sale.payments.length > 0) {
      sale.payments.forEach((p) => {
        doc.text(`${p.type}: $${p.amount.toFixed(2)}`);
      });
    } else {
      doc.text(`${sale.paymentType}: $${sale.total.toFixed(2)}`);
    }

    doc.moveDown(1);
    doc.fontSize(8).text(settings?.footerText || "¡Gracias por su compra!", { align: "center" });

    doc.end();
  });
}
