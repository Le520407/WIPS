import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Template extends Model {
  public id!: string;
  public user_id!: string;
  public name!: string;
  public language!: string;
  public category!: string;
  public status!: string;
  public components!: any;
  public template_id!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Template.init(
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
        model: User,
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en',
    },
    category: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'PENDING',
    },
    components: {
      type: DataTypes.JSONB,
    },
    template_id: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'templates',
    timestamps: true,
  }
);

export default Template;
