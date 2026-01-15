import './config/env.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import companyRoutes from './modules/company/company.routes.js';
import eventRoutes from './modules/event/event.routes.js';
import ticketRoutes from './modules/ticket/ticket.routes.js';
import salesRoutes from './modules/sales/sales.routes.js';
import userRoutes from './modules/user/user.routes.js';
import paymentsRoutes from './modules/payments/payments.route.js';
import publicRouter from './modules/event/publicEvent.route.js';
import adminEventRouter from './modules/event/adminEvent.route.js';
import publicTicketRouter from './modules/ticket/publicTicket.route.js';
import publicPaymentRouter from './modules/payments/publicPayment.route.js';
import router from './routes.js';

// Get the directory name of the current module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Load .env from parent directory (server folder)
// dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Parse and check password
// if (process.env.DATABASE_URL) {
//   const url = new URL(process.env.DATABASE_URL);
//   console.log('Username:', url.username);
//   console.log('Password:', url.password);
//   console.log('Password type:', typeof url.password);
//   console.log('Password length:', url.password?.length);
// }

// Debug: Verify .env loaded
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? '✓ YES' : '✗ NO');

// dotenv.config({ path: path.resolve('../.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/companies', companyRoutes);
app.use('/events', eventRoutes);
app.use('/tickets', ticketRoutes);
app.use('/sales', salesRoutes);
app.use('/users', userRoutes);
app.use('/payments', paymentsRoutes);
app.use('/public', publicRouter);  // Public event routes
app.use('/admin', adminEventRouter);
app.use('/public', publicTicketRouter);  // Public ticket routes
app.use('/public', publicPaymentRouter);  // Public payment routes
app.use(router);

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`)) 