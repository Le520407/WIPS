import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CommerceSettings extends Model {
  public id!: number;
  public user_id!: string;
  public phone_number_id!: string;
  public is_cart_enabled!: boolean;
  public is_catalog_visible!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CommerceSettings.init(
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
    phone_number_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    is_cart_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_catalog_visible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'commerce_settings',
    timestamps: true,
  }
);

export default CommerceSettings;
