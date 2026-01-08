import httpClient from './httpClient';

export async function initializePurchase(payload) {
  const { data } = await httpClient.post('/payments/initialize', payload);
  return data;
}

export async function verifyPayment(reference) {
  const { data } = await httpClient.get('/payments/verify', {
    params: { reference },
  });
  return data;
}