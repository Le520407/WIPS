import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CallPermissionAttributes {
  id: number;
  user_id: string;
  phone_number: string;
  status: 'no_permission' | 'pending' | 'temporary' | 'permanent' | 'rejected' | 'revoked';
  is_permanent: boolean;
  requested_at: Date | null;
  approved_at: Date | null;
  rejected_at: Date | null;
  revoked_at: Date | null;
  expires_at: Date | null;
  request_count_24h: number;
  request_count_7d: number;
  last_request_at: Date | null;
  connected_calls_24h: number;
  last_call_at: Date | null;
  consecutive_missed: number;
  warning_sent: boolean;
  permission_message_id: string | null;
  response_source: 'user_action' | 'automatic' | null;
  created_at: Date;
  updated_at: Date;
}

interface CallPermissionCreationAttributes
  extends Optional<
    CallPermissionAttributes,
    | 'id'
    | 'status'
    | 'is_permanent'
    | 'requested_at'
    | 'approved_at'
    | 'rejected_at'
    | 'revoked_at'
    | 'expires_at'
    | 'request_count_24h'
    | 'request_count_7d'
    | 'last_request_at'
    | 'connected_calls_24h'
    | 'last_call_at'
    | 'consecutive_missed'
    | 'warning_sent'
    | 'permission_message_id'
    | 'response_source'
    | 'created_at'
    | 'updated_at'
  > {}

class CallPermission
  extends Model<CallPermissionAttributes, CallPermissionCreationAttributes>
  implements CallPermissionAttributes
{
  public id!: number;
  public user_id!: string;
  public phone_number!: string;
  public status!: 'no_permission' | 'pending' | 'temporary' | 'permanent' | 'rejected' | 'revoked';
  public is_permanent!: boolean;
  public requested_at!: Date | null;
  public approved_at!: Date | null;
  public rejected_at!: Date | null;
  public revoked_at!: Date | null;
  public expires_at!: Date | null;
  public request_count_24h!: number;
  public request_count_7d!: number;
  public last_request_at!: Date | null;
  public connected_calls_24h!: number;
  public last_call_at!: Date | null;
  public consecutive_missed!: number;
  public warning_sent!: boolean;
  public permission_message_id!: string | null;
  public response_source!: 'user_action' | 'automatic' | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Helper methods
  public isExpired(): boolean {
    if (this.is_permanent) return false;
    if (!this.expires_at) return true;
    return new Date() > this.expires_at;
  }

  public canRequestPermission(): boolean {
    // Check if already has valid permission
    if (this.status === 'temporary' || this.status === 'permanent') {
      if (!this.isExpired()) return false;
    }

    // Check 24h limit (1 request per 24h)
    if (this.request_count_24h >= 1) return false;

    // Check 7d limit (2 requests per 7d)
    if (this.request_count_7d >= 2) return false;

    return true;
  }

  public canMakeCall(): boolean {
    // Check if has valid permission
    if (this.status !== 'temporary' && this.status !== 'permanent') return false;
    if (this.isExpired()) return false;

    // Check 24h call limit (10 connected calls per 24h)
    if (this.connected_calls_24h >= 10) return false;

    return true;
  }

  public resetRequestCounts(): void {
    this.request_count_24h = 0;
    this.request_count_7d = 0;
  }

  public resetCallCounts(): void {
    this.connected_calls_24h = 0;
    this.consecutive_missed = 0;
    this.warning_sent = false;
  }
}

CallPermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
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
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('no_permission', 'pending', 'temporary', 'permanent', 'rejected', 'revoked'),
      allowNull: false,
      defaultValue: 'no_permission',
    },
    is_permanent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    requested_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejected_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    request_count_24h: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    request_count_7d: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_request_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    connected_calls_24h: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    last_call_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    consecutive_missed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    warning_sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    permission_message_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    response_source: {
      type: DataTypes.ENUM('user_action', 'automatic'),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'call_permissions',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'phone_number'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['expires_at'],
      },
    ],
  }
);

export default CallPermission;
