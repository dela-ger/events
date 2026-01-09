import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../../api/payments';

const PaymentCallback = () => {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reference = searchParams.get('reference');

  // If reference is missing, derive state immediately (no effect needed)
  if (!reference && status === 'idle') {
    setMessage('Missing payment reference');
    setStatus('failed');
  }

  // Effect: run verification only if reference exists
  useEffect(() => {
    if (!reference) return;

    const run = async () => {
      setStatus('verifying');
      try {
        const res = await verifyPayment(reference);
        setStatus('success');
        setMessage(res.message || 'Payment verified successfully');
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          'Payment verification failed';
        setMessage(msg);
        setStatus('failed');
      }
    };

    run();
  }, [reference]);

  // Render states
  if (status === 'verifying') return <div>Verifying your payment…</div>;

  if (status === 'success')
    return (
      <div>
        <h2>Payment successful</h2>
        <p>{message}</p>
        <button onClick={() => navigate('/tickets', { replace: true })}>
          View tickets
        </button>
      </div>
    );

  if (status === 'failed')
    return (
      <div>
        <h2>Payment status unknown</h2>
        <p>{message}</p>
        <button onClick={() => navigate('/tickets', { replace: true })}>
          Back to tickets
        </button>
      </div>
    );

  return null;
};

export default PaymentCallback;