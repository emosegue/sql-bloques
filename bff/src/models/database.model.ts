export interface TableAttribute {
  name: string;
  type: string;
  primaryKey?: boolean;
  nullable?: boolean;
  unique?: boolean;
  foreignKey?: string;
  defaultValue?: any;
  precision?: number;
  scale?: number;
}

export interface TableSchema {
  name: string;
  attributes: TableAttribute[];
}

export interface DatabaseSchema {
  tables: TableSchema[];
}
