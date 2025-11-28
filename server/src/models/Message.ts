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
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
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
      unique: true,
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
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
  }
);

// Add toJSON method to convert snake_case to camelCase
Message.prototype.toJSON = function () {
  const values = { ...this.get() };
  return {
    id: values.id,
    fromNumber: values.from_number,
    toNumber: values.to_number,
    content: values.content,
    type: values.type,
    status: values.status,
    messageId: values.message_id,
    mediaUrl: values.media_url,
    mediaId: values.media_id,
    caption: values.caption,
    createdAt: values.createdAt,
    updatedAt: values.updatedAt,
  };
};

export default Message;
