import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MessageLogAttributes {
  id: string;
  website_id: string;
  to: string;
  from: string | null;
  type: string;
  status: string;
  whatsapp_message_id: string | null;
  direction: 'inbound' | 'outbound';
  content: string | null;
  error_message: string | null;
  timestamp: Date;
  created_at: Date;
  updated_at: Date;
}

interface MessageLogCreationAttributes
  extends Optional<MessageLogAttributes, 'id' | 'from' | 'whatsapp_message_id' | 'content' | 'error_message' | 'created_at' | 'updated_at'> {}

class MessageLog extends Model<MessageLogAttributes, MessageLogCreationAttributes> implements MessageLogAttributes {
  public id!: string;
  public website_id!: string;
  public to!: string;
  public from!: string | null;
  public type!: string;
  public status!: string;
  public whatsapp_message_id!: string | null;
  public direction!: 'inbound' | 'outbound';
  public content!: string | null;
  public error_message!: string | null;
  public timestamp!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

MessageLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    website_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'websites',
        key: 'id',
      },
    },
    to: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    from: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    whatsapp_message_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    direction: {
      type: DataTypes.ENUM('inbound', 'outbound'),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: 'message_logs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['website_id'],
      },
      {
        fields: ['timestamp'],
      },
      {
        fields: ['whatsapp_message_id'],
      },
    ],
  }
);

export default MessageLog;
export { MessageLogAttributes };
