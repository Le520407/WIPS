import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ContactLabel extends Model {
  public id!: number;
  public user_id!: string;
  public name!: string;
  public color!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ContactLabel.init(
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
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: '#3b82f6',
    },
  },
  {
    sequelize,
    tableName: 'contact_labels',
    timestamps: true,
  }
);

export default ContactLabel;
