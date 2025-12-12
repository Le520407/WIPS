import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ApiKeyAttributes {
  id: string;
  website_id: string;
  key_name: string;
  api_key: string;
  api_secret: string;
  is_active: boolean;
  rate_limit: number;
  expires_at: Date | null;
  last_used_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface ApiKeyCreationAttributes
  extends Optional<ApiKeyAttributes, 'id' | 'is_active' | 'rate_limit' | 'expires_at' | 'last_used_at' | 'created_at' | 'updated_at'> {}

class ApiKey extends Model<ApiKeyAttributes, ApiKeyCreationAttributes> implements ApiKeyAttributes {
  public id!: string;
  public website_id!: string;
  public key_name!: string;
  public api_key!: string;
  public api_secret!: string;
  public is_active!: boolean;
  public rate_limit!: number;
  public expires_at!: Date | null;
  public last_used_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ApiKey.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    website_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'websites',
        key: 'id',
      },
    },
    key_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    api_key: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    api_secret: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    rate_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 1000,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'api_keys',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ApiKey;
export { ApiKeyAttributes };
