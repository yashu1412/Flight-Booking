// services/pdfService.js

const PDFDocument = require("pdfkit");

const PDFService = {
  // ==========================================
  // GENERATE TICKET PDF
  // ==========================================
  generateTicketPDF: async (bookingData) => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margin: 50
        });

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // ========== HEADER ==========
        doc.rect(0, 0, 612, 100).fill("#1e40af");

        doc.fillColor("#ffffff")
          .fontSize(28)
          .font("Helvetica-Bold")
          .text("✈ FLIGHT TICKET", 50, 35, { align: "center" });

        doc.fontSize(12)
          .font("Helvetica")
          .text("E-TICKET / BOARDING PASS", 50, 70, { align: "center" });

        // ========== PNR SECTION ==========
        doc.fillColor("#000000");
        doc.rect(50, 120, 512, 60).stroke("#1e40af");

        doc.fontSize(10)
          .fillColor("#666666")
          .text("BOOKING REFERENCE (PNR)", 60, 130);

        doc.fontSize(32)
          .font("Helvetica-Bold")
          .fillColor("#dc2626")
          .text(bookingData.pnr, 60, 145);

        doc.fontSize(10)
          .font("Helvetica")
          .fillColor("#666666")
          .text("STATUS", 400, 130);

        doc.fontSize(16)
          .font("Helvetica-Bold")
          .fillColor("#16a34a")
          .text(bookingData.status || "CONFIRMED", 400, 148);

        // ========== PASSENGER DETAILS ==========
        doc.fontSize(14)
          .font("Helvetica-Bold")
          .fillColor("#1e40af")
          .text("PASSENGER DETAILS", 50, 200);

        doc.moveTo(50, 218).lineTo(562, 218).stroke("#1e40af");

        doc.fontSize(10)
          .font("Helvetica")
          .fillColor("#666666")
          .text("PASSENGER NAME", 50, 230);

        doc.fontSize(18)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text(bookingData.passenger_name.toUpperCase(), 50, 245);

        // ========== FLIGHT DETAILS ==========
        doc.fontSize(14)
          .font("Helvetica-Bold")
          .fillColor("#1e40af")
          .text("FLIGHT DETAILS", 50, 290);

        doc.moveTo(50, 308).lineTo(562, 308).stroke("#1e40af");

        // Airline & Flight
        doc.fontSize(10)
          .font("Helvetica")
          .fillColor("#666666")
          .text("AIRLINE", 50, 320);

        doc.fontSize(14)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text(bookingData.airline, 50, 335);

        doc.fontSize(10)
          .font("Helvetica")
          .fillColor("#666666")
          .text("FLIGHT NUMBER", 250, 320);

        doc.fontSize(14)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text(bookingData.flight_id, 250, 335);

        // ========== ROUTE ==========
        const routeY = 380;

        // Departure
        doc.fontSize(10)
          .font("Helvetica")
          .fillColor("#666666")
          .text("FROM", 50, routeY);

        doc.fontSize(24)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text(bookingData.departure_city, 50, routeY + 15);

        doc.fontSize(12)
          .font("Helvetica")
          .fillColor("#666666")
          .text(bookingData.departure_time || "--:--", 50, routeY + 45);

        // Arrow
        doc.fontSize(30)
          .fillColor("#1e40af")
          .text("→", 260, routeY + 15);

        // Arrival
        doc.fontSize(10)
          .font("Helvetica")
          .fillColor("#666666")
          .text("TO", 350, routeY);

        doc.fontSize(24)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text(bookingData.arrival_city, 350, routeY + 15);

        doc.fontSize(12)
          .font("Helvetica")
          .fillColor("#666666")
          .text(bookingData.arrival_time || "--:--", 350, routeY + 45);

        // ========== PAYMENT DETAILS ==========
        doc.fontSize(14)
          .font("Helvetica-Bold")
          .fillColor("#1e40af")
          .text("PAYMENT DETAILS", 50, 480);

        doc.moveTo(50, 498).lineTo(562, 498).stroke("#1e40af");

        // Amount box
        doc.rect(50, 510, 200, 60).fill("#f0fdf4").stroke("#16a34a");

        doc.fontSize(10)
          .font("Helvetica")
          .fillColor("#666666")
          .text("AMOUNT PAID", 60, 520);

        doc.fontSize(28)
          .font("Helvetica-Bold")
          .fillColor("#16a34a")
          .text(`₹${parseFloat(bookingData.final_price).toLocaleString("en-IN")}`, 60, 538);

        // Booking date
        doc.fontSize(10)
          .font("Helvetica")
          .fillColor("#666666")
          .text("BOOKING DATE", 280, 520);

        const bookingDate = new Date(bookingData.booking_date);
        doc.fontSize(12)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text(bookingDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
          }), 280, 538);

        doc.fontSize(10)
          .font("Helvetica")
          .fillColor("#666666")
          .text("BOOKING TIME", 280, 555);

        doc.fontSize(12)
          .font("Helvetica-Bold")
          .fillColor("#000000")
          .text(bookingDate.toLocaleTimeString("en-IN"), 280, 570);

        // ========== FOOTER ==========
        doc.moveTo(50, 650).lineTo(562, 650).stroke("#cccccc");

        doc.fontSize(8)
          .font("Helvetica")
          .fillColor("#666666")
          .text(
            "This is a computer-generated ticket and does not require a signature.",
            50, 660, { align: "center", width: 512 }
          );

        doc.text(
          "Please carry a valid photo ID for verification at the airport.",
          50, 675, { align: "center", width: 512 }
          );

        doc.text(
          `Generated on: ${new Date().toLocaleString("en-IN")}`,
          50, 695, { align: "center", width: 512 }
        );

        // ========== IMPORTANT NOTICE ==========
        doc.rect(50, 720, 512, 50).fill("#fef3c7").stroke("#f59e0b");

        doc.fontSize(9)
          .font("Helvetica-Bold")
          .fillColor("#92400e")
          .text("IMPORTANT:", 60, 730);

        doc.fontSize(8)
          .font("Helvetica")
          .text(
            "• Please arrive at the airport at least 2 hours before departure",
            60, 745
          );
        doc.text(
          "• Carry this ticket along with a valid government-issued ID",
          60, 757
        );

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }
};

module.exports = PDFService;