export const mockSchema = {
  tables: [
    {
      name: 'users',
      attributes: [
        { name: 'id', type: 'int', primaryKey: true },
        { name: 'name', type: 'varchar', nullable: false },
        { name: 'email', type: 'varchar', unique: true },
        { name: 'created_at', type: 'timestamp' },
      ],
    },
    {
      name: 'orders',
      attributes: [
        { name: 'id', type: 'int', primaryKey: true },
        { name: 'user_id', type: 'int', foreignKey: 'users.id' },
        { name: 'total', type: 'decimal' },
        { name: 'status', type: 'varchar', defaultValue: 'pending' },
        { name: 'created_at', type: 'timestamp' },
      ],
    },
    {
      name: 'products',
      attributes: [
        { name: 'id', type: 'int', primaryKey: true },
        { name: 'name', type: 'varchar' },
        { name: 'price', type: 'decimal' },
        { name: 'stock', type: 'int', defaultValue: 0 },
        { name: 'created_at', type: 'timestamp' },
      ],
    },
    {
      name: 'order_items',
      attributes: [
        { name: 'id', type: 'int', primaryKey: true },
        { name: 'order_id', type: 'int', foreignKey: 'orders.id' },
        { name: 'product_id', type: 'int', foreignKey: 'products.id' },
        { name: 'quantity', type: 'int' },
        { name: 'price', type: 'decimal' },
      ],
    },
  ],
};
