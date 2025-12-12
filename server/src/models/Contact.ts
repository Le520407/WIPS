import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Contact extends Model {
  public id!: number;
  public user_id!: string;
  public phone_number!: string;
  public name?: string;
  public notes?: string;
  public labels?: number[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Contact.init(
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
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    labels: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'contacts',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'phone_number'],
      },
    ],
  }
);

export default Contact;
