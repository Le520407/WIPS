import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class RolePermission extends Model {
  public role!: 'super_admin' | 'admin' | 'manager' | 'agent';
  public permission_id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RolePermission.init(
  {
    role: {
      type: DataTypes.ENUM('super_admin', 'admin', 'manager', 'agent'),
      allowNull: false,
      primaryKey: true,
    },
    permission_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'permissions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'role_permissions',
    timestamps: true,
  }
);

export default RolePermission;
