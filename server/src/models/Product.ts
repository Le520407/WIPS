import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Product extends Model {
  public id!: number;
  public catalog_id!: string;
  public product_retailer_id!: string;
  public name!: string;
  public description?: string;
  public price!: number;
  public currency!: string;
  public image_url?: string;
  public availability!: 'in stock' | 'out of stock';
  public url?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    catalog_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    product_retailer_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    availability: {
      type: DataTypes.ENUM('in stock', 'out of stock'),
      allowNull: false,
      defaultValue: 'in stock',
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['catalog_id', 'product_retailer_id'],
      },
    ],
  }
);

export default Product;
