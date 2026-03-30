import { Request, Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize';
import Connection from '../models/connection.model';
import { IConnection, IConnectionTest } from '../interfaces/connection.interface';
import { Op } from 'sequelize';

class ConnectionsController {
  public async createConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const connectionData: IConnection = req.body;
      const connection = await Connection.create(connectionData);

      const connectionResponse = connection.toJSON();

      res.status(201).json({
        success: true,
        data: connectionResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  public async testConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const connectionData: IConnectionTest = req.body;

      const testSequelize = new Sequelize(
        connectionData.database,
        connectionData.user,
        connectionData.password,
        {
          host: connectionData.host,
          port: connectionData.port,
          dialect: connectionData.type,
          logging: false,
          dialectOptions: {
            connectTimeout: 5000,
          },
        },
      );

      await testSequelize.authenticate();
      await testSequelize.close();

      res.status(200).json({
        success: true,
        message: 'Conexión exitosa',
      });
    } catch {
      res.status(400).json({
        success: false,
        message: 'No se pudo establecer la conexión. Verificá los datos ingresados.',
      });
    }
  }

  public async getAllConnections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeDeleted =
        req.header('X-Include-Deleted') === 'true' || req.header('X-Include-Deleted') === '1';

      const whereClause = !includeDeleted ? { deletedAt: null } : {};

      const connections = await Connection.findAll({
        where: whereClause,
      });

      res.status(200).json({
        success: true,
        count: connections.length,
        data: connections,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeDeleted =
        req.header('X-Include-Deleted') === 'true' || req.header('X-Include-Deleted') === '1';

      const whereClause = !includeDeleted
        ? { id: req.params.id, deletedAt: null }
        : { id: req.params.id };

      const connection = await Connection.findOne({
        where: whereClause,
      });

      if (!connection) {
        const errorMessage = includeDeleted
          ? 'Conexión no encontrada (ni activa ni eliminada)'
          : 'Conexión no encontrada o ha sido eliminada';

        res.status(404).json({
          success: false,
          message: errorMessage,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: connection,
      });
    } catch (error) {
      next(error);
    }
  }

  public async updateConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [updated] = await Connection.update(req.body, {
        where: { id: req.params.id },
      });

      if (updated) {
        const updatedConnection = await Connection.findByPk(req.params.id);
        res.status(200).json({
          success: true,
          data: updatedConnection,
        });
        return;
      }

      res.status(404).json({
        success: false,
        message: 'Conexión no encontrada',
      });
    } catch (error) {
      next(error);
    }
  }

  public async deleteConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [updated] = await Connection.update(
        { deletedAt: new Date() },
        { where: { id: req.params.id, deletedAt: null } },
      );

      if (updated) {
        res.status(200).json({
          success: true,
          message: 'Conexión marcada como eliminada',
        });
        return;
      }

      res.status(404).json({
        success: false,
        message: 'Conexión no encontrada o ya eliminada',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ConnectionsController();
