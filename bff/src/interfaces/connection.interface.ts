export type DatabaseDialect = 'mysql' | 'postgres' | 'sqlite' | 'mssql';

export interface IConnection {
  id?: number;
  name: string;
  type: DatabaseDialect;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export interface IConnectionTest {
  type: 'mysql' | 'postgres' | 'sqlite' | 'mssql';
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface IConnectionCreate extends Omit<IConnection, 'id' | 'createdAt' | 'updatedAt'> {}
export interface IConnectionUpdate extends Partial<IConnectionCreate> {}
