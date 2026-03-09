import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Import CSS as raw text for print window
import "./Receipt.css";

import logo from "../../../assets/donor/logo.png";

export default function DonationReceipt() {
  const receiptRef = useRef(null);

  // ===================== PDF DOWNLOAD =====================
  const downloadPDF = () => {
    html2canvas(receiptRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save("Vidyasetu_Receipt.pdf");
    });
  };

  // ===================== IMAGE DOWNLOAD =====================
  const downloadImage = () => {
    html2canvas(receiptRef.current, { scale: 2 }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "Vidyasetu_Receipt.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  // ===================== PRINT RECEIPT =====================
  const printReceipt = () => {
    const printContents = receiptRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    // Replace body temporarily
    document.body.innerHTML = `
    <div class="print-area">
      ${printContents}
    </div>
  `;

    window.print();

    // Restore UI
    document.body.innerHTML = originalContents;
    window.location.reload();
  };


  return (
    <div className="receipt-wrapper">
      {/* ACTION BUTTONS */}
      <div className="receipt-actions no-print">
        <button onClick={downloadPDF}>Download PDF</button>
        <button onClick={downloadImage}>Download Image</button>
        <button onClick={printReceipt}>Print</button>
      </div>

      {/* RECEIPT CONTENT */}
      <div className="receipt-box" ref={receiptRef}>
        {/* HEADER */}
        <div className="receipt-header">
          <img src={logo} alt="Vidyasetu Logo" className="receipt-logo" />

          <div>
            <h1>VIDYASETU FOUNDATION</h1>
            <p className="tagline">A Digital Bridge for Education Support</p>
            <p className="contact">support@vidyasetu.org • www.vidyasetu.org</p>
          </div>
        </div>

        <h2 className="receipt-title">DONATION RECEIPT</h2>

        {/* TOP INFO TABLE */}
        <table className="info-table">
          <tbody>
            <tr>
              <th>Donor Name</th>
              <td>Almira Karjikar</td>
              <th>Receipt No</th>
              <td>VS-2632</td>
            </tr>

            <tr>
              <th>Donation For</th>
              <td>Student Aid Support</td>
              <th>Date</th>
              <td>04-Jul-2025</td>
            </tr>

            <tr>
              <th>Beneficiary</th>
              <td>Riwuk Rash (B.Tech CSE)</td>
              <th>Mode</th>
              <td>Card</td>
            </tr>
          </tbody>
        </table>

        {/* AMOUNT TABLE */}
        <table className="amount-table">
          <thead>
            <tr>
              <th>Description</th>
              <th className="amt-col">Amount (₹)</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Vidyasetu Educational Support Donation</td>
              <td className="amt-col">68,500.00</td>
            </tr>
          </tbody>
        </table>

        {/* TOTAL */}
        <table className="amount-table">
          <tbody>
            <tr className="total-row">
              <td>
                <strong>Total</strong>
              </td>
              <td className="amt-col">
                <strong>₹ 68,500.00</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* FOOTER NOTE */}
        <p className="note">
          <strong>Note:</strong> This is a computer-generated receipt. No
          signature is required.
        </p>

        <p className="footer-text">Thank you for supporting education </p>
      </div>
    </div>
  );
}
