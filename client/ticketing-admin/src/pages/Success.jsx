import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import httpClient from "../api/httpClient";

export default function Success() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying payment...");
  const reference = searchParams.get("reference");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus("No payment reference found.");
        return;
      }

      try {
        // Call your public verify endpoint
        const res = await httpClient.get("/public/payments/verify", {
          params: { reference },
        });

        if (res.data.status === "success") {
          setStatus("Payment Successful 🎉 Thank you for your purchase!");
        } else {
          setStatus("Payment verification failed. Please contact support.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("Error verifying payment. Please try again.");
      }
    };

    verifyPayment();
  }, [reference]);

  return (
    <div className="success-page">
      <h2>{status}</h2>
      {reference && <p>Your payment reference: {reference}</p>}
    </div>
  );
}
