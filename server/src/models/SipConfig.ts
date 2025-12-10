import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SipServerConfig {
  hostname: string;
  port: number;
  request_uri_user_params?: {
    [key: string]: string;
  };
}

interface SipConfigAttributes {
  id: string;
  user_id: string;
  phone_number_id: string;
  sip_enabled: boolean;
  sip_servers: SipServerConfig[];
  sip_user_password: string | null;
  srtp_key_exchange_protocol: 'DTLS' | 'SDES';
  last_synced_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface SipConfigCreationAttributes extends Optional<SipConfigAttributes, 'id' | 'sip_user_password' | 'last_synced_at' | 'created_at' | 'updated_at'> {}

class SipConfig extends Model<SipConfigAttributes, SipConfigCreationAttributes> implements SipConfigAttributes {
  public id!: string;
  public user_id!: string;
  public phone_number_id!: string;
  public sip_enabled!: boolean;
  public sip_servers!: SipServerConfig[];
  public sip_user_password!: string | null;
  public srtp_key_exchange_protocol!: 'DTLS' | 'SDES';
  public last_synced_at!: Date | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SipConfig.init(
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
    phone_number_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sip_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    sip_servers: {
      type: DataTypes.JSONB,
      defaultValue: [],
      allowNull: false,
    },
    sip_user_password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    srtp_key_exchange_protocol: {
      type: DataTypes.ENUM('DTLS', 'SDES'),
      defaultValue: 'DTLS',
      allowNull: false,
    },
    last_synced_at: {
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
    tableName: 'sip_configs',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default SipConfig;
export { SipServerConfig, SipConfigAttributes };
