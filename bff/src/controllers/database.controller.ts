import { Request, Response, NextFunction } from 'express';
import mysql from 'mysql2/promise';
import { IConnection } from '../interfaces/connection.interface';
import { DatabaseSchema, TableAttribute, TableSchema } from '../models/database.model';
import { i18n, SupportedLanguage } from '../i18n';

class DatabaseController {
  public getDatabaseSchema = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const connectionParams: IConnection = req.body;

      if (!connectionParams.host || !connectionParams.user || !connectionParams.database) {
        return this.handleError(res, 400, 'Faltan parámetros de conexión requeridos');
      }

      const connection = await this.createDatabaseConnection(connectionParams);
      const [tables] = await connection.query<mysql.RowDataPacket[]>(
        'SELECT TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?',
        [connectionParams.database],
      );

      const databaseSchema = await this.buildDatabaseSchema(connection, connectionParams.database, tables);
      await connection.end();

      res.status(200).json({ success: true, data: databaseSchema });
    } catch (error) {
      this.handleDatabaseError(error, res, next);
    }
  };

  public executeQuery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const language: SupportedLanguage = req.body?.language === 'en' ? 'en' : 'es';
    try {
      const { connection_params, query, page = 1, results = 10 } = req.body;

      if (!connection_params || !query) {
        return this.handleError(res, 400, i18n('ERROR_MISSING_PARAMS', {}, language));
      }

      if (!connection_params.host || !connection_params.user || !connection_params.database) {
        return this.handleError(res, 400, i18n('ERROR_MISSING_CONNECTION_PARAMS', {}, language));
      }

      if (isNaN(page) || isNaN(results) || page < 1 || results < 1) {
        return this.handleError(res, 400, i18n('ERROR_INVALID_PAGINATION_PARAMS', {}, language));
      }
  
      const cleanedQuery = query.trim().replace(/;\s*$/, '');

      const connection = await this.createDatabaseConnection(connection_params);
  
      const isSelectQuery = /^\s*SELECT/i.test(cleanedQuery);
      const isInsertOrUpdate = /^\s*(INSERT|UPDATE|DELETE)/i.test(cleanedQuery);
      const hasLimit = /LIMIT\s+(\d+)/i.exec(cleanedQuery);
      const existingLimit = hasLimit ? parseInt(hasLimit[1], 10) : null;
  
      let finalQuery = cleanedQuery;
      let totalResults = 0;
      let totalPages = 1;
      let queryResults: mysql.RowDataPacket[] = [];
  
      if (isSelectQuery) {
        // Contar total de resultados sin paginar
        const [countResult] = await connection.query<mysql.RowDataPacket[]>(`SELECT COUNT(*) as total FROM (${cleanedQuery}) as subquery`);
        totalResults = countResult[0].total;
        totalPages = Math.ceil(totalResults / results);
  
        // Aplicar paginación si LIMIT < 10
        if (existingLimit !== null && existingLimit < 5) {
          finalQuery = cleanedQuery;
        } else {
          const offset = (page - 1) * results;
          finalQuery = `${cleanedQuery} LIMIT ${offset}, ${results}`;
        }
  
        const [rows] = await connection.query<mysql.RowDataPacket[]>(finalQuery);
        queryResults = rows;
      } else if (isInsertOrUpdate) {
        // Ejecutar la consulta y devolver filas afectadas
        const [result] = await connection.query<mysql.OkPacket>(cleanedQuery);
        totalResults = result.affectedRows;
      }

      await connection.end();
      res.status(200).json({
        success: true,
        data: {
          results: queryResults, // Vacío para INSERT, UPDATE, DELETE
          pagination: {
            totalResults,
            totalPages,
            currentPage: page,
            resultsPerPage: results,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        },
      });
    } catch (error) {
      this.handleDatabaseError(error, res, next, language);
    }
  };

  private createDatabaseConnection = async (params: IConnection): Promise<mysql.Connection> => {
    return await mysql.createConnection({
      host: params.host,
      port: params.port || 3306,
      user: params.user,
      password: params.password,
      database: params.database,
    });
  };

  private buildDatabaseSchema = async (
    connection: mysql.Connection,
    databaseName: string,
    tables: mysql.RowDataPacket[],
  ): Promise<DatabaseSchema> => {
    const databaseSchema: DatabaseSchema = { tables: [] };

    for (const table of tables) {
      const [columns] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT 
          COLUMN_NAME as name,
          DATA_TYPE as type,
          COLUMN_KEY = 'PRI' as isPrimaryKey,
          IS_NULLABLE = 'YES' as isNullable,
          COLUMN_DEFAULT as defaultValue,
          CHARACTER_MAXIMUM_LENGTH as maxLength
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION`,
        [databaseName, table.name],
      );

      const [foreignKeys] = await connection.query<mysql.RowDataPacket[]>(
        `SELECT 
          COLUMN_NAME as columnName,
          REFERENCED_TABLE_NAME as referencedTable,
          REFERENCED_COLUMN_NAME as referencedColumn
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE 
          TABLE_SCHEMA = ? AND 
          TABLE_NAME = ? AND
          REFERENCED_TABLE_NAME IS NOT NULL`,
        [databaseName, table.name],
      );

      const tableSchema = this.buildTableSchema(table.name, columns, foreignKeys);
      databaseSchema.tables.push(tableSchema);
    }

    return databaseSchema;
  };

  private buildTableSchema = (
    tableName: string,
    columns: mysql.RowDataPacket[],
    foreignKeys: mysql.RowDataPacket[],
  ): TableSchema => {
    const tableSchema: TableSchema = {
      name: tableName,
      attributes: columns.map((column) => {
        const attribute: TableAttribute = {
          name: column.name,
          type: column.type,
          primaryKey: column.isPrimaryKey,
          nullable: column.isNullable,
          defaultValue: column.defaultValue,
        };

        if (column.precision) {
          attribute.precision = column.precision;
          if (column.scale) attribute.scale = column.scale;
        }

        const fk = foreignKeys.find((fk) => fk.columnName === column.name);
        if (fk) attribute.foreignKey = `${fk.referencedTable}.${fk.referencedColumn}`;

        return attribute;
      }),
    };

    return tableSchema;
  };

  private handleDatabaseError(error: any, res: Response, next: NextFunction, lang: SupportedLanguage = 'es'): void {
    const { code, sqlMessage = '' } = error;
    let translatedMessage = i18n(code, {}, lang) || `Error desconocido: ${sqlMessage || 'No hay detalles disponibles.'}`;

    switch (code) {
      case 'ER_ROW_IS_REFERENCED_2': {
        const match = sqlMessage.match(/REFERENCES `(.+?)` \(`(.+?)`\)/);
        if (match) {
          const [, referencedTable, referencedColumn] = match;
          translatedMessage = i18n('ERROR_ROW_REFERENCED_2', { referencedTable, referencedColumn }, lang);
        } else {
          translatedMessage = i18n('ERROR_ROW_REFERENCED_GENERIC', {}, lang);
        }
        break;
      }

      case 'ER_NO_DEFAULT_FOR_FIELD': {
        const match = sqlMessage.match(/Field '(.+?)' doesn't have a default value/);
        if (match) {
          const [, field] = match;
          translatedMessage = i18n('ERROR_FIELD_MISSING_DEFAULT', { field }, lang);
        }
        break;
      }

      case 'ER_WARN_DATA_OUT_OF_RANGE': {
        const match = sqlMessage.match(/Out of range value for column '(.+?)'/);
        if (match) {
          const [, column] = match;
          translatedMessage = i18n('ERROR_OUT_OF_RANGE_VALUE', { column }, lang);
        }
        break;
      }
      
      case 'WARN_DATA_TRUNCATED': {
        const match = sqlMessage.match(/column '(.+?)'/i);
        if (match) {
          const [, column] = match;
          translatedMessage = i18n('ERROR_WARN_DATA_TRUNCATED', { column }, lang);
        }
        break;
      }
      
      case 'ER_NO_SUCH_TABLE': {
        const match = sqlMessage.match(/Table '.*?\.(.+?)' doesn't exist/);
        if (match) {
          const [, table] = match;
          translatedMessage = i18n('ERROR_TABLE_NOT_FOUND', { table }, lang);
        } else {
          translatedMessage = i18n('ERROR_TABLE_NOT_FOUND_GENERIC', {}, lang);
        }
        break;
      }

      case 'ER_TRUNCATED_WRONG_VALUE': {
        const match = sqlMessage.match(/Incorrect .*? value: '(.+?)' for column '(.+?)'/);
        if (match) {
          const [, value, column] = match;
          translatedMessage = i18n('ERROR_INSERT_INVALID_TYPE', { value, column }, lang);
        }
        break;
      }

      case 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD': {
        const match = sqlMessage.match(/Incorrect .*? value: '(.+?)' for column '(.+?)'/);
        if (match) {
          const [, value, column] = match;
          translatedMessage = i18n('ERROR_INVALID_FIELD_VALUE', { value, column }, lang);
        }
        break;
      }
  
      case 'ERROR_DATA_TOO_LONG_COLUMN': {
        const match = sqlMessage.match(/Data too long for column '(.+?)'/);
        if (match) {
          const [, column] = match;
          translatedMessage = i18n('ERROR_DATA_TOO_LONG', { column }, lang);
        }
        break;
      }
  
      case 'ER_BAD_FIELD_ERROR': {
        const match = sqlMessage.match(/Unknown column '(.+?)'/);
        if (match) {
          const [, column] = match;
          translatedMessage = i18n('ERROR_UNKNOWN_COLUMN', { column }, lang);
        }
        break;
      }

      case 'ER_NON_UNIQ_ERROR': {
        const match = sqlMessage.match(/Column '(.+?)' in field list is ambiguous/);
        if (match) {
          const [, column] = match;
          translatedMessage = i18n('ERROR_COLUMN_AMBIGUOUS', { column }, lang);
        } else {
          translatedMessage = i18n('ERROR_COLUMN_AMBIGUOUS_GENERIC', {}, lang);
        }
        break;
      }

      case 'ER_WRONG_NUMBER_OF_COLUMNS_IN_SELECT': {
        translatedMessage = i18n('ERROR_UNION_COLUMN_MISMATCH', {}, lang);
        break;
      }

      case 'ER_NO_REFERENCED_ROW_2': {
        const match = sqlMessage.match(/FOREIGN KEY \(`(.+?)`\) REFERENCES `(.+?)` \(`(.+?)`\)/);
        if (match) {
          const [, field, referencedTable, referencedColumn] = match;
          translatedMessage = i18n('ERROR_FOREIGN_KEY_VIOLATION', { field, table: referencedTable, column: referencedColumn }, lang);
        } else {
          translatedMessage = i18n('ERROR_FOREIGN_KEY_VIOLATION_GENERIC', {}, lang);
        }
        break;
      }
    }
  
    res.status(400).json({
      success: false,
      message: translatedMessage,
    });
  }


  private handleError = (res: Response, statusCode: number, message: string): void => {
    res.status(statusCode).json({ success: false, message });
  };
}

export default new DatabaseController();