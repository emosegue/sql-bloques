import express from 'express';
import cors from 'cors';
import connectionsRouter from './routes/connections.routes';
import sequelize from './config/database';
import Connection from './models/connection.model';
import errorHandler from './utils/errorHandler';
import { authenticate } from './middlewares/auth';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

if (!process.env.API_TOKEN) {
  console.error('ERROR: API_TOKEN no está definido en .env');
  process.exit(1);
}

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Auth-Token', 'X-Include-Deleted', 'Accept-Language'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authenticate);

app.use('/api/connections', connectionsRouter);

app.use(errorHandler);

const startServer = async () => {
  const PORT: number = Number(process.env.PORT) || 3000;
  const HOST: string = '0.0.0.0'; 
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Conexión a SQLite establecida y modelos sincronizados');

    if (process.env.SEED_CONNECTIONS === 'true') {
      const count = await Connection.count();
      if (count === 0) {
        const host = process.env.SEED_DB_HOST || 'localhost';
        const port = Number(process.env.SEED_DB_PORT) || 3307;
        const user = process.env.SEED_DB_USER || 'sqlbloques';
        const password = process.env.SEED_DB_PASSWORD || 'sqlbloques';

        await Connection.bulkCreate([
          { name: 'Sistema de Ventas', type: 'mysql', host, port, user, password, database: 'sistema_ventas' },
          { name: 'Universidad',      type: 'mysql', host, port, user, password, database: 'universidad' },
          { name: 'Hospital',         type: 'mysql', host, port, user, password, database: 'hospital' },
        ]);
        console.log('Conexiones de prueba creadas automáticamente');
      }
    }

    app.listen(PORT, HOST, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar la aplicación:', error);
    process.exit(1);
  }
};

startServer();

export default app;
