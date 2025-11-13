import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import companyRoutes from './modules/company/company.routes.js';
import eventRoutes from './modules/event/event.routes.js';
import ticketRoutes from './modules/ticket/ticket.routes.js';
import salesRoutes from './modules/sales/sales.routes.js';
import router from './routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(router);
app.use('/companies', companyRoutes);
app.use('/events', eventRoutes);
app.use('/tickets', ticketRoutes);
app.use('/sales', salesRoutes);

app.get('health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`)) 