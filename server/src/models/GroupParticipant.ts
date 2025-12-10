import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface GroupParticipantAttributes {
  id: string;
  group_id: string; // Our internal group ID
  wa_id: string; // WhatsApp user ID
  joined_at: Date;
  created_at: Date;
  updated_at: Date;
}

interface GroupParticipantCreationAttributes
  extends Optional<GroupParticipantAttributes, 'id' | 'created_at' | 'updated_at'> {}

class GroupParticipant
  extends Model<GroupParticipantAttributes, GroupParticipantCreationAttributes>
  implements GroupParticipantAttributes
{
  public id!: string;
  public group_id!: string;
  public wa_id!: string;
  public joined_at!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

GroupParticipant.init(
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
    wa_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    joined_at: {
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
    tableName: 'group_participants',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['group_id', 'wa_id'],
      },
    ],
  }
);

export default GroupParticipant;
export { GroupParticipantAttributes };
