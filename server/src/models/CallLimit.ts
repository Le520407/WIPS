import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CallLimitAttributes {
  id: number;
  user_id: string;
  phone_number: string;
  
  // Call counts
  calls_24h: number;
  calls_today: number;
  calls_this_week: number;
  calls_this_month: number;
  
  // Timestamps for rolling windows
  window_start_24h?: Date;
  last_call_at?: Date;
  
  // Limits (can be customized per user)
  limit_24h: number; // Default: 10 for production, 100 for sandbox
  
  // Status
  is_limited: boolean;
  limit_reset_at?: Date;
  
  // Timestamps
  created_at?: Date;
  updated_at?: Date;
}

interface CallLimitCreationAttributes extends Optional<CallLimitAttributes, 'id' | 'calls_24h' | 'calls_today' | 'calls_this_week' | 'calls_this_month' | 'is_limited'> {}

class CallLimit extends Model<CallLimitAttributes, CallLimitCreationAttributes> implements CallLimitAttributes {
  public id!: number;
  public user_id!: string;
  public phone_number!: string;
  
  public calls_24h!: number;
  public calls_today!: number;
  public calls_this_week!: number;
  public calls_this_month!: number;
  
  public window_start_24h?: Date;
  public last_call_at?: Date;
  
  public limit_24h!: number;
  
  public is_limited!: boolean;
  public limit_reset_at?: Date;
  
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Helper methods
  public canMakeCall(): boolean {
    // Check if within 24h limit
    if (this.calls_24h >= this.limit_24h) {
      return false;
    }
    return true;
  }

  public getRemainingCalls(): number {
    return Math.max(0, this.limit_24h - this.calls_24h);
  }

  public getUsagePercentage(): number {
    return Math.round((this.calls_24h / this.limit_24h) * 100);
  }

  public needsWarning(): boolean {
    // Warn when 80% of limit is reached
    return this.getUsagePercentage() >= 80;
  }

  public getTimeUntilReset(): number {
    if (!this.window_start_24h) return 0;
    
    const resetTime = new Date(this.window_start_24h);
    resetTime.setHours(resetTime.getHours() + 24);
    
    const now = new Date();
    const diff = resetTime.getTime() - now.getTime();
    
    return Math.max(0, diff);
  }

  public incrementCallCount(): void {
    this.calls_24h += 1;
    this.calls_today += 1;
    this.calls_this_week += 1;
    this.calls_this_month += 1;
    this.last_call_at = new Date();
    
    // Check if limit reached
    if (this.calls_24h >= this.limit_24h) {
      this.is_limited = true;
      const resetTime = new Date(this.window_start_24h || new Date());
      resetTime.setHours(resetTime.getHours() + 24);
      this.limit_reset_at = resetTime;
    }
  }

  public resetIfNeeded(): boolean {
    if (!this.window_start_24h) {
      this.window_start_24h = new Date();
      return false;
    }

    const now = new Date();
    const windowStart = new Date(this.window_start_24h);
    const hoursSinceStart = (now.getTime() - windowStart.getTime()) / (1000 * 60 * 60);

    // Reset 24h window if more than 24 hours have passed
    if (hoursSinceStart >= 24) {
      this.calls_24h = 0;
      this.window_start_24h = now;
      this.is_limited = false;
      this.limit_reset_at = undefined;
      return true;
    }

    return false;
  }
}

CallLimit.init(
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
    calls_24h: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    calls_today: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    calls_this_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    calls_this_month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    window_start_24h: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_call_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    limit_24h: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: process.env.WHATSAPP_ENV === 'sandbox' ? 100 : 10,
    },
    is_limited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    limit_reset_at: {
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
    tableName: 'call_limits',
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
        fields: ['is_limited'],
      },
    ],
  }
);

export default CallLimit;
