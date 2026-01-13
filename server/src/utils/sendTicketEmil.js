import { transporter } from "../config/email";
import QRCode from "qrcode";

export async function sendTicketEmail(to, event, ticket, quantity, ticketCode) {
  // Generate QR code for ticketCode
  const qrDataUrl = await QRCode.toDataURL(ticketCode);

  const mailOptions = {
    from: '"Event Tickets" <no-reply@yourapp.com>',
    to,
    subject: `Your ticket for ${event.title}`,
    html: `
      <h2>Your Ticket Confirmation</h2>
      <p>Thank you for purchasing tickets to <strong>${event.title}</strong>.</p>
      <p>Date: ${event.start_time}</p>
      <p>Venue: ${event.venue}</p>
      <p>Ticket Type: ${ticket.name}</p>
      <p>Quantity: ${quantity}</p>
      <p><strong>Ticket Code:</strong> ${ticketCode}</p>
      <p>Please present this QR code at the event entrance:</p>
      <img src="${qrDataUrl}" alt="Ticket QR Code" />
    `,
  };

  await transporter.sendMail(mailOptions);
}
