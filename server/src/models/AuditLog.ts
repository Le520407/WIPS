import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class AuditLog extends Model {
  public id!: number;
  public user_id!: string;
  public account_id?: string;
  public action!: string;
  public resource_type!: string;
  public resource_id?: string;
  public details!: any;
  public ip_address?: string;
  public user_agent?: string;
  public readonly createdAt!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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
    account_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    resource_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    resource_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    updatedAt: false,
  }
);

export default AuditLog;
