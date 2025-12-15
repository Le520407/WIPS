import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface OTPCodeAttributes {
  id: string;
  user_id: string;
  phone_number: string;
  code: string;
  template_name: string;
  expires_at: Date;
  verified: boolean;
  verified_at?: Date;
  attempts: number;
  created_at: Date;
  updated_at: Date;
}

interface OTPCodeCreationAttributes extends Optional<OTPCodeAttributes, 'id' | 'verified' | 'attempts' | 'created_at' | 'updated_at'> {}

class OTPCode extends Model<OTPCodeAttributes, OTPCodeCreationAttributes> implements OTPCodeAttributes {
  public id!: string;
  public user_id!: string;
  public phone_number!: string;
  public code!: string;
  public template_name!: string;
  public expires_at!: Date;
  public verified!: boolean;
  public verified_at?: Date;
  public attempts!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

OTPCode.init(
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
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Recipient phone number',
    },
    code: {
      type: DataTypes.STRING(15),
      allowNull: false,
      comment: 'OTP code (max 15 chars)',
    },
    template_name: {
      type: DataTypes.STRING(512),
      allowNull: false,
      comment: 'Template used to send OTP',
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When the OTP expires',
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of verification attempts',
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
    tableName: 'otp_codes',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['phone_number', 'verified'],
      },
      {
        fields: ['expires_at'],
      },
    ],
  }
);

export default OTPCode;
