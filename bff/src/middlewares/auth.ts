import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();
const API_TOKEN = process.env.API_TOKEN;

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header('X-Auth-Token');

  if (!API_TOKEN) {
    console.error('API_TOKEN no está configurado en .env');
    res.status(500).json({
      success: false,
      message: 'Configuración del servidor incompleta',
    });
    return;
  }

  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: 'Token de autorización requerido',
    });
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  if (token !== API_TOKEN) {
    res.status(403).json({
      success: false,
      message: 'Token no válido',
    });
    return;
  }

  next();
};
