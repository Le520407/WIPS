import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CallAttributes {
  id: string;
  user_id: string;
  call_id: string; // WhatsApp call ID
  from_number: string;
  to_number: string;
  type: 'incoming' | 'outgoing';
  status: 'ringing' | 'connected' | 'ended' | 'missed' | 'rejected' | 'failed';
  duration?: number; // seconds
  start_time: Date;
  end_time?: Date;
  context?: string; // tracking context
  sdp?: string; // SDP offer from WhatsApp (for incoming calls)
  callback_sent?: boolean; // Whether callback was initiated
  callback_sent_at?: Date;
  callback_completed?: boolean; // Whether callback was completed/handled
  callback_completed_at?: Date;
  viewed_at?: Date; // When the missed call was viewed by user
  createdAt?: Date;
  updatedAt?: Date;
}

interface CallCreationAttributes extends Optional<CallAttributes, 'id' | 'duration' | 'end_time' | 'context' | 'createdAt' | 'updatedAt'> {}

class Call extends Model<CallAttributes, CallCreationAttributes> implements CallAttributes {
  public id!: string;
  public user_id!: string;
  public call_id!: string;
  public from_number!: string;
  public to_number!: string;
  public type!: 'incoming' | 'outgoing';
  public status!: 'ringing' | 'connected' | 'ended' | 'missed' | 'rejected' | 'failed';
  public duration?: number;
  public start_time!: Date;
  public end_time?: Date;
  public context?: string;
  public sdp?: string;
  public callback_sent?: boolean;
  public callback_sent_at?: Date;
  public callback_completed?: boolean;
  public callback_completed_at?: Date;
  public viewed_at?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Call.init(
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
    call_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    from_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('incoming', 'outgoing'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ringing', 'connected', 'ended', 'missed', 'rejected', 'failed'),
      allowNull: false,
      defaultValue: 'ringing',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    context: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sdp: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    callback_sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    callback_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    callback_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    callback_completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    viewed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'calls',
    timestamps: true,
  }
);

export default Call;
