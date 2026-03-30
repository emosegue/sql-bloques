import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { IConnection } from '../interfaces/connection.interface';

type ConnectionCreationAttributes = Optional<IConnection, 'id' | 'createdAt' | 'updatedAt'>;

class Connection extends Model<IConnection, ConnectionCreationAttributes> implements IConnection {
  public id!: number;
  public name!: string;
  public type!: 'mysql' | 'postgres' | 'sqlite' | 'mssql';
  public host!: string;
  public port!: number;
  public user!: string;
  public password!: string;
  public database!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Connection.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre de la conexión es requerido',
        },
      },
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'mysql',
      validate: {
        isIn: {
          args: [['mysql', 'postgres', 'mongodb', 'sqlite', 'mssql']],
          msg: 'Tipo de base de datos no soportado',
        },
      },
    },
    host: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El host es requerido',
        },
      },
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'El puerto debe ser un número entero',
        },
        min: 1,
        max: 65535,
      },
    },
    user: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El usuario es requerido',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La contraseña es requerida',
        },
        len: {
          args: [4, 100],
          msg: 'La contraseña debe tener entre 4 y 100 caracteres',
        },
      },
    },
    database: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre de la base de datos es requerido',
        },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: 'Connection',
    tableName: 'connections',
    timestamps: true,
  },
);

export default Connection;
