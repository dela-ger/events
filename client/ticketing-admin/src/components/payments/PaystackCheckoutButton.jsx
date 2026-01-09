import { useState } from 'react';
import { initializePurchase } from '../../api/payments';

const PaystackCheckoutButton = ({ ticketId, quantity, email, onInitSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await initializePurchase({ ticketId, quantity, email });
      onInitSuccess?.(res.reference);
      window.location.assign(res.authorization_url);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Could not initialize payment';
      console.error('Payment init error:', msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? 'Redirecting…' : 'Pay with Paystack'}
    </button>
  );
};

export default PaystackCheckoutButton;