import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface WebsiteAttributes {
  id: string;
  user_id: string;
  name: string;
  domain: string | null;
  description: string | null;
  phone_number_id: string;
  webhook_url: string | null;
  webhook_secret: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface WebsiteCreationAttributes
  extends Optional<WebsiteAttributes, 'id' | 'domain' | 'description' | 'webhook_url' | 'webhook_secret' | 'is_active' | 'created_at' | 'updated_at'> {}

class Website extends Model<WebsiteAttributes, WebsiteCreationAttributes> implements WebsiteAttributes {
  public id!: string;
  public user_id!: string;
  public name!: string;
  public domain!: string | null;
  public description!: string | null;
  public phone_number_id!: string;
  public webhook_url!: string | null;
  public webhook_secret!: string | null;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Website.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone_number_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    webhook_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    webhook_secret: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'websites',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Website;
export { WebsiteAttributes };
