import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import clientRoutes from './routes/clientRoutes.js'
import saleRoutes from './routes/saleRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()
const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes)
app.use('/api/productos', productRoutes);
app.use('/api/categorias', categoryRoutes);
app.use('/api/clientes', clientRoutes)
app.use('/api/sales', saleRoutes)
app.use('/api/settings', settingsRoutes)

app.listen(4000, () => console.log('Servidor corriendo en puerto 4000'));
