import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Conversation extends Model {
  public id!: string;
  public user_id!: string;
  public phone_number!: string;
  public last_message!: string;
  public last_message_time!: Date;
  public unread_count!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Conversation.init(
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
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_message: {
      type: DataTypes.TEXT,
    },
    last_message_time: {
      type: DataTypes.DATE,
    },
    unread_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'conversations',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'phone_number'],
      },
    ],
  }
);

// Add toJSON method to convert snake_case to camelCase
Conversation.prototype.toJSON = function () {
  const values = { ...this.get() };
  return {
    id: values.id,
    phoneNumber: values.phone_number,
    lastMessage: values.last_message,
    lastMessageTime: values.last_message_time,
    unreadCount: values.unread_count,
  };
};

export default Conversation;
