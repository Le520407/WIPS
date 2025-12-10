import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface GroupJoinRequestAttributes {
  id: string;
  group_id: string; // Our internal group ID
  whatsapp_group_id: string; // WhatsApp group ID
  join_request_id: string; // WhatsApp join request ID
  wa_id: string; // WhatsApp user ID
  status: 'pending' | 'approved' | 'rejected';
  request_timestamp: Date;
  processed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface GroupJoinRequestCreationAttributes
  extends Optional<GroupJoinRequestAttributes, 'id' | 'processed_at' | 'created_at' | 'updated_at'> {}

class GroupJoinRequest
  extends Model<GroupJoinRequestAttributes, GroupJoinRequestCreationAttributes>
  implements GroupJoinRequestAttributes
{
  public id!: string;
  public group_id!: string;
  public whatsapp_group_id!: string;
  public join_request_id!: string;
  public wa_id!: string;
  public status!: 'pending' | 'approved' | 'rejected';
  public request_timestamp!: Date;
  public processed_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

GroupJoinRequest.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    group_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'groups',
        key: 'id',
      },
    },
    whatsapp_group_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    join_request_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    wa_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    request_timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    processed_at: {
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
    tableName: 'group_join_requests',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default GroupJoinRequest;
export { GroupJoinRequestAttributes };
