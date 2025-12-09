import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface BusinessHours {
  enabled: boolean;
  timezone: string;
  schedule: {
    [key: string]: {
      enabled: boolean;
      periods: Array<{
        start: string; // HH:mm format
        end: string;   // HH:mm format
      }>;
    };
  };
}

interface CallSettingsAttributes {
  id: string;
  user_id: string;
  calling_enabled: boolean;
  inbound_enabled: boolean;
  outbound_enabled: boolean;
  callback_enabled: boolean;
  business_hours: BusinessHours | null;
  auto_reply_message: string | null;
  created_at: Date;
  updated_at: Date;
}

interface CallSettingsCreationAttributes extends Optional<CallSettingsAttributes, 'id' | 'created_at' | 'updated_at'> {}

class CallSettings extends Model<CallSettingsAttributes, CallSettingsCreationAttributes> implements CallSettingsAttributes {
  public id!: string;
  public user_id!: string;
  public calling_enabled!: boolean;
  public inbound_enabled!: boolean;
  public outbound_enabled!: boolean;
  public callback_enabled!: boolean;
  public business_hours!: BusinessHours | null;
  public auto_reply_message!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CallSettings.init(
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
    calling_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    inbound_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    outbound_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    callback_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    business_hours: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    auto_reply_message: {
      type: DataTypes.TEXT,
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
    tableName: 'call_settings',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default CallSettings;
export { BusinessHours, CallSettingsAttributes };
