import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AuthTemplateAttributes {
  id: string;
  user_id: string;
  template_id: string;
  name: string;
  language: string;
  category: 'AUTHENTICATION';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED';
  otp_type: 'COPY_CODE' | 'ONE_TAP' | 'ZERO_TAP';
  add_security_recommendation: boolean;
  code_expiration_minutes?: number;
  button_text?: string;
  autofill_text?: string;
  package_name?: string;
  signature_hash?: string;
  message_send_ttl_seconds?: number;
  created_at: Date;
  updated_at: Date;
}

interface AuthTemplateCreationAttributes extends Optional<AuthTemplateAttributes, 'id' | 'template_id' | 'status' | 'created_at' | 'updated_at'> {}

class AuthTemplate extends Model<AuthTemplateAttributes, AuthTemplateCreationAttributes> implements AuthTemplateAttributes {
  public id!: string;
  public user_id!: string;
  public template_id!: string;
  public name!: string;
  public language!: string;
  public category!: 'AUTHENTICATION';
  public status!: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISABLED';
  public otp_type!: 'COPY_CODE' | 'ONE_TAP' | 'ZERO_TAP';
  public add_security_recommendation!: boolean;
  public code_expiration_minutes?: number;
  public button_text?: string;
  public autofill_text?: string;
  public package_name?: string;
  public signature_hash?: string;
  public message_send_ttl_seconds?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

AuthTemplate.init(
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
    template_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Meta template ID returned after creation',
    },
    name: {
      type: DataTypes.STRING(512),
      allowNull: false,
      comment: 'Template name',
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Language code (e.g., en_US, zh_CN)',
    },
    category: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'AUTHENTICATION',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'PENDING',
      comment: 'Template status from Meta',
    },
    otp_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'COPY_CODE, ONE_TAP, or ZERO_TAP',
    },
    add_security_recommendation: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Include security warning text',
    },
    code_expiration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Code expiration time (1-90 minutes)',
    },
    button_text: {
      type: DataTypes.STRING(25),
      allowNull: true,
      comment: 'Copy code button text (max 25 chars)',
    },
    autofill_text: {
      type: DataTypes.STRING(25),
      allowNull: true,
      comment: 'Autofill button text (max 25 chars)',
    },
    package_name: {
      type: DataTypes.STRING(224),
      allowNull: true,
      comment: 'Android app package name (for ONE_TAP/ZERO_TAP)',
    },
    signature_hash: {
      type: DataTypes.STRING(11),
      allowNull: true,
      comment: 'App signing key hash (for ONE_TAP/ZERO_TAP)',
    },
    message_send_ttl_seconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Message time-to-live in seconds',
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
    tableName: 'auth_templates',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default AuthTemplate;
