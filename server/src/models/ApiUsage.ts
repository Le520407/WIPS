import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ApiUsageAttributes {
  id: string;
  api_key_id: string;
  website_id: string;
  endpoint: string;
  request_count: number;
  success_count: number;
  error_count: number;
  date: string;
  created_at: Date;
  updated_at: Date;
}

interface ApiUsageCreationAttributes
  extends Optional<ApiUsageAttributes, 'id' | 'request_count' | 'success_count' | 'error_count' | 'created_at' | 'updated_at'> {}

class ApiUsage extends Model<ApiUsageAttributes, ApiUsageCreationAttributes> implements ApiUsageAttributes {
  public id!: string;
  public api_key_id!: string;
  public website_id!: string;
  public endpoint!: string;
  public request_count!: number;
  public success_count!: number;
  public error_count!: number;
  public date!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ApiUsage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    api_key_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'api_keys',
        key: 'id',
      },
    },
    website_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'websites',
        key: 'id',
      },
    },
    endpoint: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    request_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    success_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    error_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'api_usage',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ApiUsage;
export { ApiUsageAttributes };
