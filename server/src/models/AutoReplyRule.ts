import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class AutoReplyRule extends Model {
  public id!: number;
  public user_id!: string;
  public name!: string;
  public trigger_type!: 'keyword' | 'exact' | 'greeting' | 'away' | 'default';
  public trigger_value?: string;
  public reply_message!: string;
  public is_active!: boolean;
  public priority!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AutoReplyRule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    trigger_type: {
      type: DataTypes.ENUM('keyword', 'exact', 'greeting', 'away', 'default'),
      allowNull: false,
    },
    trigger_value: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    reply_message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'auto_reply_rules',
    timestamps: true,
  }
);

export default AutoReplyRule;
export { AutoReplyRule };
