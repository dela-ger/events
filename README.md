# events
An app to sell tickets for events
# 🎟 Event Ticketing Platform Documentation

## 📌 Overview
This project is a **React.js frontend + Node.js/Express backend** ticketing platform.  
It allows users to:
- Browse upcoming events
- View event details
- Purchase tickets via Paystack integration
- See location‑aware recommendations (“Events Near You”)

The frontend is styled with **CSS Modules** for production‑grade, responsive UI.

---

## 🏗 Architecture

### Frontend
- **Framework:** React.js (Vite or CRA)
- **Routing:** `react-router-dom`
- **Styling:** CSS Modules (`ComponentName.module.css`)
- **Components:**
  - `HomePage.jsx` → Displays highlight banner, upcoming events, ads, and “Near You” section.
  - `EventCard.jsx` → Reusable card for event previews.
  - `TicketDetailPage.jsx` → Detailed view of tickets for a specific event.
  - `PaystackCheckoutButton.jsx` → Handles payment initialization and redirect.

### Backend
- **Framework:** Express.js
- **Endpoints:**
  - `GET /public/events` → Returns all published events with metadata (title, description, city, country, venue, banner_url, start_time, end_time).
  - `GET /public/events/:id/tickets` → Returns tickets for a specific event.
  - `POST /payments/initialize` → Initializes Paystack purchase.

### Database
- Events and tickets stored with fields:
  - `id`, `title`, `description`, `venue`, `city`, `country`, `banner_url`, `start_time`, `end_time`
  - Tickets: `id`, `name`, `description`, `price_cents`, `currency`, `quantity_total`, `quantity_sold`

---

## 🎨 Styling
Each component has its own CSS module:
- `HomePage.module.css` → Layout, highlight banner, ads, grid.
- `TicketDetailPage.module.css` → Hero banner, ticket cards, responsive forms.
- `PaystackCheckoutButton.module.css` → Gradient button with hover/active/disabled states.

Responsive design:
- Uses `@media` queries for tablet (≤1024px), mobile (≤768px), and small mobile (≤480px).
- Grids collapse to single column on mobile.
- Buttons expand to full width on mobile for tap‑friendly UX.

---

## 💳 Payments
### Paystack Integration
- `PaystackCheckoutButton.jsx` calls `initializePurchase(eventId, ticketId, { quantity, email })`.
- Backend returns:
  - `reference` → unique payment reference
  - `authorization_url` → redirect URL
- Button redirects user to Paystack checkout.

---

## 📍 Location Awareness
### “Events Near You” Section
- Detects user location dynamically:
  - **Primary:** IP‑based lookup via `https://ipapi.co/json/`
  - **Fallback:** Defaults to `Accra, Ghana` if detection fails
- Filters events by `city` and `country` fields.
- Displays them using `EventCard`.

Testing:
- Use VPN or mock API response to simulate different cities.
- Add manual override (dropdown) for QA.

---

## 🚀 Deployment
### Backend
- Deploy to Render/Heroku/AWS.
- Expose `/public/events` and `/payments/initialize`.

### Frontend
- Deploy to Netlify/Vercel.
- Set environment variable:
  ```env
  VITE_API_URL=https://your-backend-url.com
