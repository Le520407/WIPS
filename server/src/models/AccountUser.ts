import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class AccountUser extends Model {
  public id!: number;
  public account_id!: string;
  public user_id!: string;
  public role!: 'admin' | 'manager' | 'agent';
  public permissions!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AccountUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    account_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'agent'),
      allowNull: false,
      defaultValue: 'agent',
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'account_users',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['account_id', 'user_id'],
      },
    ],
  }
);

export default AccountUser;
