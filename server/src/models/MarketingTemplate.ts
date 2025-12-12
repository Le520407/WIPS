import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MarketingTemplateAttributes {
  id: number;
  user_id: string;
  template_id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  header_type?: string;
  header_text?: string;
  header_image_url?: string;
  body_text: string;
  footer_text?: string;
  button_text?: string;
  button_url?: string;
  ttl?: number;
  ad_id?: string;
  ad_adset_id?: string;
  ad_campaign_id?: string;
  ad_account_id?: string;
  created_at: Date;
  updated_at: Date;
}

interface MarketingTemplateCreationAttributes
  extends Optional<
    MarketingTemplateAttributes,
    | 'id'
    | 'header_type'
    | 'header_text'
    | 'header_image_url'
    | 'footer_text'
    | 'button_text'
    | 'button_url'
    | 'ttl'
    | 'ad_id'
    | 'ad_adset_id'
    | 'ad_campaign_id'
    | 'ad_account_id'
    | 'created_at'
    | 'updated_at'
  > {}

class MarketingTemplate
  extends Model<MarketingTemplateAttributes, MarketingTemplateCreationAttributes>
  implements MarketingTemplateAttributes
{
  public id!: number;
  public user_id!: string;
  public template_id!: string;
  public name!: string;
  public language!: string;
  public category!: string;
  public status!: string;
  public header_type?: string;
  public header_text?: string;
  public header_image_url?: string;
  public body_text!: string;
  public footer_text?: string;
  public button_text?: string;
  public button_url?: string;
  public ttl?: number;
  public ad_id?: string;
  public ad_adset_id?: string;
  public ad_campaign_id?: string;
  public ad_account_id?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

MarketingTemplate.init(
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
    template_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    header_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    header_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    header_image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    body_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    footer_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    button_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    button_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ttl: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ad_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ad_adset_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ad_campaign_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ad_account_id: {
      type: DataTypes.STRING,
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
    tableName: 'marketing_templates',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default MarketingTemplate;
