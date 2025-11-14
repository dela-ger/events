export const sendTicketConfirmationEmail = async (user, ticket, quantity) => {
  console.log(`📧 Stub: Send email to ${user.email} for ${quantity} x ${ticket.name}`);
};

export const triggerWebhook = async (eventType, payload) => {
  console.log(`🔔 Stub: Trigger webhook for ${eventType}`, payload);
};