import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class BlockedUser extends Model {
  public id!: string;
  public userId!: string;
  public phoneNumberId!: string;
  public blockedPhoneNumber!: string;
  public waId!: string;
  public reason?: string;
  public blockedAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BlockedUser.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    phoneNumberId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'phone_number_id',
    },
    blockedPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'blocked_phone_number',
    },
    waId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'wa_id',
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    blockedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'blocked_at',
    },
  },
  {
    sequelize,
    tableName: 'blocked_users',
    timestamps: true,
    underscored: true,
  }
);

export default BlockedUser;
