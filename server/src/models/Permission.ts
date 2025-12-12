import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Permission extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public category!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'permissions',
    timestamps: true,
  }
);

export default Permission;
