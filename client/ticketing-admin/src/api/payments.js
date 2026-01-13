// api/payments.js
import httpClient from './httpClient';

export async function initializePurchase(eventId, ticketId, payload) {
  const { data } = await httpClient.post(
    `/public/events/${eventId}/tickets/${ticketId}/purchase`,
    payload
  );
  return data;
}

export async function verifyPayment(reference) {
  const { data } = await httpClient.get('/payments/verify', {
    params: { reference },
  });
  return data;
}
