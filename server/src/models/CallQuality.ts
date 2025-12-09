import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CallQualityAttributes {
  id: number;
  user_id: string;
  phone_number: string;
  
  // Call statistics
  total_calls: number;
  connected_calls: number;
  missed_calls: number;
  rejected_calls: number;
  failed_calls: number;
  
  // Consecutive tracking
  consecutive_missed: number;
  consecutive_connected: number;
  
  // Quality metrics
  pickup_rate: number; // Percentage (0-100)
  
  // Warning tracking
  warning_sent: boolean;
  warning_sent_at?: Date;
  
  // Time tracking
  last_call_at?: Date;
  last_connected_at?: Date;
  last_missed_at?: Date;
  
  // Timestamps
  created_at?: Date;
  updated_at?: Date;
}

interface CallQualityCreationAttributes extends Optional<CallQualityAttributes, 'id' | 'total_calls' | 'connected_calls' | 'missed_calls' | 'rejected_calls' | 'failed_calls' | 'consecutive_missed' | 'consecutive_connected' | 'pickup_rate' | 'warning_sent'> {}

class CallQuality extends Model<CallQualityAttributes, CallQualityCreationAttributes> implements CallQualityAttributes {
  public id!: number;
  public user_id!: string;
  public phone_number!: string;
  
  public total_calls!: number;
  public connected_calls!: number;
  public missed_calls!: number;
  public rejected_calls!: number;
  public failed_calls!: number;
  
  public consecutive_missed!: number;
  public consecutive_connected!: number;
  
  public pickup_rate!: number;
  
  public warning_sent!: boolean;
  public warning_sent_at?: Date;
  
  public last_call_at?: Date;
  public last_connected_at?: Date;
  public last_missed_at?: Date;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Helper methods
  public calculatePickupRate(): number {
    if (this.total_calls === 0) return 0;
    return Math.round((this.connected_calls / this.total_calls) * 100);
  }

  public updatePickupRate(): void {
    this.pickup_rate = this.calculatePickupRate();
  }

  public needsWarning(): boolean {
    // Warning threshold: 2 consecutive missed calls (Sandbox: 5)
    const threshold = process.env.WHATSAPP_ENV === 'sandbox' ? 5 : 2;
    return this.consecutive_missed >= threshold && !this.warning_sent;
  }

  public needsRevocation(): boolean {
    // Revocation threshold: 4 consecutive missed calls (Sandbox: 10)
    const threshold = process.env.WHATSAPP_ENV === 'sandbox' ? 10 : 4;
    return this.consecutive_missed >= threshold;
  }

  public getQualityStatus(): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (this.pickup_rate >= 90) return 'excellent';
    if (this.pickup_rate >= 75) return 'good';
    if (this.pickup_rate >= 60) return 'fair';
    if (this.pickup_rate >= 40) return 'poor';
    return 'critical';
  }

  public resetWarning(): void {
    this.warning_sent = false;
    this.warning_sent_at = undefined;
  }
}

CallQuality.init(
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
    total_calls: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    connected_calls: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    missed_calls: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    rejected_calls: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    failed_calls: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    consecutive_missed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    consecutive_connected: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    pickup_rate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    warning_sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    warning_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_call_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_connected_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_missed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'call_quality',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'phone_number'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['pickup_rate'],
      },
      {
        fields: ['consecutive_missed'],
      },
    ],
  }
);

export default CallQuality;
