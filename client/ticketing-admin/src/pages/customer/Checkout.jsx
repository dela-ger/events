import { useState } from "react";
import { useParams } from "react-router-dom";
import { useApi } from "../../lib/api";

export default function Checkout() {
  const { eventId, ticketId } = useParams();
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Call the hook to get the axios client
  const api = useApi();

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const res = await api.post(
        `/public/events/${eventId}/tickets/${ticketId}/purchase`,
        { email, quantity }
      );
      // Redirect to Paystack checkout
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      console.error("Purchase error:", err);
      alert("Could not start payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>
      <label>Email:</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Quantity:</label>
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <button onClick={handlePurchase} disabled={loading}>
        {loading ? "Processing..." : "Buy Ticket"}
      </button>
    </div>
  );
}
