import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MarketingCampaignAttributes {
  id: number;
  user_id: string;
  name: string;
  template_id: string;
  template_name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  target_audience: any; // JSON: { contacts: string[], labels: string[] }
  scheduled_at?: Date;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  clicked_count: number;
  conversion_count: number;
  total_spend: number;
  ad_id?: string;
  ad_campaign_id?: string;
  created_at: Date;
  updated_at: Date;
}

interface MarketingCampaignCreationAttributes
  extends Optional<
    MarketingCampaignAttributes,
    | 'id'
    | 'sent_count'
    | 'delivered_count'
    | 'read_count'
    | 'clicked_count'
    | 'conversion_count'
    | 'total_spend'
    | 'scheduled_at'
    | 'ad_id'
    | 'ad_campaign_id'
    | 'created_at'
    | 'updated_at'
  > {}

class MarketingCampaign
  extends Model<
    MarketingCampaignAttributes,
    MarketingCampaignCreationAttributes
  >
  implements MarketingCampaignAttributes
{
  public id!: number;
  public user_id!: string;
  public name!: string;
  public template_id!: string;
  public template_name!: string;
  public status!: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  public target_audience!: any;
  public scheduled_at?: Date;
  public sent_count!: number;
  public delivered_count!: number;
  public read_count!: number;
  public clicked_count!: number;
  public conversion_count!: number;
  public total_spend!: number;
  public ad_id?: string;
  public ad_campaign_id?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

MarketingCampaign.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    template_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    template_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'sending', 'completed', 'paused'),
      allowNull: false,
      defaultValue: 'draft',
    },
    target_audience: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sent_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    delivered_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    read_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    clicked_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    conversion_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_spend: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    ad_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ad_campaign_id: {
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
    tableName: 'marketing_campaigns',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default MarketingCampaign;
