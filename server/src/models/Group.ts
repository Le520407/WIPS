import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface GroupAttributes {
  id: string;
  user_id: string;
  group_id: string; // WhatsApp group ID
  subject: string;
  description: string | null;
  invite_link: string | null;
  join_approval_mode: 'auto_approve' | 'approval_required';
  total_participant_count: number;
  suspended: boolean;
  creation_timestamp: Date;
  created_at: Date;
  updated_at: Date;
}

interface GroupCreationAttributes
  extends Optional<GroupAttributes, 'id' | 'description' | 'invite_link' | 'created_at' | 'updated_at'> {}

class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  public id!: string;
  public user_id!: string;
  public group_id!: string;
  public subject!: string;
  public description!: string | null;
  public invite_link!: string | null;
  public join_approval_mode!: 'auto_approve' | 'approval_required';
  public total_participant_count!: number;
  public suspended!: boolean;
  public creation_timestamp!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Group.init(
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
    group_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    subject: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    invite_link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    join_approval_mode: {
      type: DataTypes.ENUM('auto_approve', 'approval_required'),
      defaultValue: 'auto_approve',
      allowNull: false,
    },
    total_participant_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    suspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    creation_timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
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
    tableName: 'groups',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Group;
export { GroupAttributes };
