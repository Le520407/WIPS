import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Message extends Model {
  public id!: string;
  public user_id!: string;
  public from_number!: string;
  public to_number!: string;
  public content!: string;
  public type!: string;
  public status!: string;
  public message_id!: string;
  public media_url?: string;
  public media_id?: string;
  public caption?: string;
  public context_message_id?: string;
  public context_message_content?: string;
  public context_message_type?: string;
  public context_message_media_url?: string;
  public reaction_emoji?: string;
  public reaction_message_id?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
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
    from_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'text',
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'sent',
    },
    message_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    media_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    media_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    context_message_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    context_message_content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    context_message_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    context_message_media_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reaction_emoji: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    reaction_message_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'message_id'],
        name: 'unique_user_message'
      }
    ]
  }
);

// Add toJSON method to convert snake_case to camelCase
Message.prototype.toJSON = function () {
  const values = { ...this.get() };
  return {
    id: values.id,
    userId: values.user_id,
    fromNumber: values.from_number,
    toNumber: values.to_number,
    content: values.content,
    type: values.type,
    status: values.status,
    messageId: values.message_id,
    mediaUrl: values.media_url,
    mediaId: values.media_id,
    caption: values.caption,
    contextMessageId: values.context_message_id,
    contextMessageContent: values.context_message_content,
    contextMessageType: values.context_message_type,
    contextMessageMediaUrl: values.context_message_media_url,
    reactionEmoji: values.reaction_emoji,
    reactionMessageId: values.reaction_message_id,
    createdAt: values.createdAt,
    updatedAt: values.updatedAt,
  };
};

export default Message;
