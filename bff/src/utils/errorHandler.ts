import { ErrorRequestHandler } from 'express';
import { ValidationError } from 'sequelize';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof ValidationError) {
    res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors.map((e) => e.message),
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
  });
};

export default errorHandler;
