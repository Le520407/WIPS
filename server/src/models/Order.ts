import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Order extends Model {
  public id!: number;
  public user_id!: string;
  public order_id!: string;
  public customer_phone!: string;
  public customer_name?: string;
  public items!: any[];
  public total_amount!: number;
  public currency!: string;
  public status!: 'pending' | 'processing' | 'completed' | 'cancelled';
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    customer_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
  }
);

export default Order;
