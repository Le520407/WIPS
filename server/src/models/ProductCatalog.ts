import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ProductCatalog extends Model {
  public id!: number;
  public user_id!: string;
  public catalog_id!: string;
  public name!: string;
  public is_connected!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductCatalog.init(
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
    catalog_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    is_connected: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'product_catalogs',
    timestamps: true,
  }
);

export default ProductCatalog;
