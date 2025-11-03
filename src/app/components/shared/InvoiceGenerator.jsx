'use client';
import { useRef } from 'react';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

export function generateInvoice(order, onComplete) {
  const doc = new jsPDF();
  
  // Colors matching the design system
  const primaryColor = '#0B4866';
  const secondaryColor = '#0F4C81';
  
  // Header
  doc.setFillColor(11, 72, 102);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Company Logo/Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Usave', 20, 20);
  
  doc.setFontSize(10);
  doc.text('123 Business Street', 20, 30);
  doc.text('Sydney, NSW 2000, Australia', 20, 37);
  
  // Invoice Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.text('INVOICE', 160, 30);
  
  // Invoice details
  doc.setFontSize(10);
  doc.text(`Invoice #${order.orderNumber}`, 160, 37);
  
  // Line separator
  doc.setDrawColor(11, 72, 102);
  doc.setLineWidth(0.5);
  doc.line(20, 45, 190, 45);
  
  // Bill To Section
  let yPos = 55;
  doc.setFontSize(12);
  doc.text('Bill To:', 20, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  const billToName = `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`;
  doc.text(billToName, 20, yPos);
  
  yPos += 5;
  if (order.shippingAddress?.address1) {
    doc.text(order.shippingAddress.address1, 20, yPos);
    yPos += 5;
  }
  
  if (order.shippingAddress?.address2) {
    doc.text(order.shippingAddress.address2, 20, yPos);
    yPos += 5;
  }
  
  const cityState = `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.postalCode || ''}`;
  doc.text(cityState, 20, yPos);
  yPos += 5;
  
  if (order.shippingAddress?.country) {
    doc.text(order.shippingAddress.country, 20, yPos);
  }
  
  // Payment Information
  yPos = 55;
  doc.setFontSize(12);
  doc.text('Payment Information:', 120, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.text(`Method: ${order.paymentMethod || 'Credit Card'}`, 120, yPos);
  yPos += 5;
  doc.text(`Status: Completed`, 120, yPos);
  yPos += 5;
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 120, yPos);
  
  // Table Header
  yPos = 85;
  doc.setFillColor(240, 247, 255);
  doc.rect(20, yPos - 5, 170, 7, 'F');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Item', 22, yPos);
  doc.text('Quantity', 100, yPos);
  doc.text('Price', 140, yPos);
  doc.text('Total', 175, yPos);
  
  doc.setFont(undefined, 'normal');
  
  // Table Rows
  yPos += 8;
  let totalAmount = 0;
  
  order.items?.forEach((item, index) => {
    const product = item.product || {};
    const itemTotal = (item.price || 0) * item.quantity;
    totalAmount += itemTotal;
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, yPos - 3, 170, 8, 'F');
    }
    
    // Wrap long item names
    const itemName = product.title || 'Product';
    const maxWidth = 50;
    const wrappedText = doc.splitTextToSize(itemName, maxWidth);
    
    doc.text(wrappedText, 22, yPos);
    doc.text(`${item.quantity}`, 100, yPos);
    doc.text(`$${item.price.toFixed(2)}`, 140, yPos);
    doc.text(`$${itemTotal.toFixed(2)}`, 175, yPos);
    
    yPos += 5 + (wrappedText.length - 1) * 5;
    
    // Page break if needed
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
  });
  
  // Totals Section
  yPos += 5;
  doc.setLineWidth(0.3);
  doc.setDrawColor(200, 200, 200);
  doc.line(140, yPos, 190, yPos);
  yPos += 8;
  
  doc.text('Subtotal:', 145, yPos);
  doc.text(`$${order.subtotal.toFixed(2)}`, 175, yPos);
  yPos += 5;
  
  if (order.tax > 0) {
    doc.text('Tax (10% GST):', 145, yPos);
    doc.text(`$${order.tax.toFixed(2)}`, 175, yPos);
    yPos += 5;
  }
  
  if (order.shipping > 0) {
    doc.text('Shipping:', 145, yPos);
    doc.text(`$${order.shipping.toFixed(2)}`, 175, yPos);
    yPos += 5;
  }
  
  // Total
  yPos += 2;
  doc.setDrawColor(11, 72, 102);
  doc.setLineWidth(0.5);
  doc.line(140, yPos, 190, yPos);
  yPos += 8;
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('Total:', 145, yPos);
  doc.setTextColor(11, 72, 102);
  doc.text(`$${order.total.toFixed(2)}`, 175, yPos);
  
  // Footer
  doc.setTextColor(100, 100, 100);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(8);
  const pageCount = doc.internal.pages.length - 1;
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      'Thank you for your business!',
      105,
      280,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      105,
      285,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  const filename = `invoice_${order.orderNumber}.pdf`;
  doc.save(filename);
  
  if (onComplete) {
    onComplete();
  }
}

export default function InvoiceGenerator({ order, className = '' }) {
  const handleDownload = () => {
    generateInvoice(order, () => {
      // Optional: Show success message
      console.log('Invoice downloaded successfully');
    });
  };
  
  return (
    <button
      onClick={handleDownload}
      className={`flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors ${className}`}
    >
      <Download size={20} />
      Download Invoice
    </button>
  );
}


