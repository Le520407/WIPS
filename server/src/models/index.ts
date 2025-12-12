import User from './User';
import Message from './Message';
import Conversation from './Conversation';
import Template from './Template';
import Call from './Call';
import CallPermission from './CallPermission';
import CallQuality from './CallQuality';
import CallLimit from './CallLimit';
import SipConfig from './SipConfig';
import Group from './Group';
import GroupParticipant from './GroupParticipant';
import GroupJoinRequest from './GroupJoinRequest';
import Website from './Website';
import ApiKey from './ApiKey';
import ApiUsage from './ApiUsage';
import MessageLog from './MessageLog';
import Contact from './Contact';
import ContactLabel from './ContactLabel';
import AutoReplyRule from './AutoReplyRule';
import ProductCatalog from './ProductCatalog';
import CommerceSettings from './CommerceSettings';
import Order from './Order';
import Product from './Product';
import MarketingTemplate from './MarketingTemplate';
import MarketingCampaign from './MarketingCampaign';
import Account from './Account';
import AccountUser from './AccountUser';
import Permission from './Permission';
import RolePermission from './RolePermission';
import AuditLog from './AuditLog';
import ConversationalComponent from './ConversationalComponent';

// Define associations
User.hasMany(Message, { foreignKey: 'user_id' });
Message.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Conversation, { foreignKey: 'user_id' });
Conversation.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Template, { foreignKey: 'user_id' });
Template.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Call, { foreignKey: 'user_id' });
Call.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CallPermission, { foreignKey: 'user_id' });
CallPermission.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CallQuality, { foreignKey: 'user_id' });
CallQuality.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CallLimit, { foreignKey: 'user_id' });
CallLimit.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(SipConfig, { foreignKey: 'user_id' });
SipConfig.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Group, { foreignKey: 'user_id' });
Group.belongsTo(User, { foreignKey: 'user_id' });

Group.hasMany(GroupParticipant, { foreignKey: 'group_id' });
GroupParticipant.belongsTo(Group, { foreignKey: 'group_id' });

Group.hasMany(GroupJoinRequest, { foreignKey: 'group_id' });
GroupJoinRequest.belongsTo(Group, { foreignKey: 'group_id' });

User.hasMany(Website, { foreignKey: 'user_id' });
Website.belongsTo(User, { foreignKey: 'user_id' });

Website.hasMany(ApiKey, { foreignKey: 'website_id' });
ApiKey.belongsTo(Website, { foreignKey: 'website_id' });

Website.hasMany(ApiUsage, { foreignKey: 'website_id' });
ApiUsage.belongsTo(Website, { foreignKey: 'website_id' });

ApiKey.hasMany(ApiUsage, { foreignKey: 'api_key_id' });
ApiUsage.belongsTo(ApiKey, { foreignKey: 'api_key_id' });

Website.hasMany(MessageLog, { foreignKey: 'website_id' });
MessageLog.belongsTo(Website, { foreignKey: 'website_id' });

User.hasMany(Contact, { foreignKey: 'user_id' });
Contact.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(ContactLabel, { foreignKey: 'user_id' });
ContactLabel.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(AutoReplyRule, { foreignKey: 'user_id' });
AutoReplyRule.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(ProductCatalog, { foreignKey: 'user_id' });
ProductCatalog.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CommerceSettings, { foreignKey: 'user_id' });
CommerceSettings.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(MarketingTemplate, { foreignKey: 'user_id' });
MarketingTemplate.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(MarketingCampaign, { foreignKey: 'user_id' });
MarketingCampaign.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(ConversationalComponent, { foreignKey: 'userId' });
ConversationalComponent.belongsTo(User, { foreignKey: 'userId' });

// Account associations
Account.belongsToMany(User, { through: AccountUser, foreignKey: 'account_id' });
User.belongsToMany(Account, { through: AccountUser, foreignKey: 'user_id' });

AccountUser.belongsTo(Account, { foreignKey: 'account_id' });
AccountUser.belongsTo(User, { foreignKey: 'user_id' });

// Permission associations
Permission.belongsToMany(RolePermission, { through: 'role_permissions', foreignKey: 'permission_id' });
RolePermission.belongsTo(Permission, { foreignKey: 'permission_id' });

// Audit log associations
AuditLog.belongsTo(User, { foreignKey: 'user_id' });
AuditLog.belongsTo(Account, { foreignKey: 'account_id' });

export {
  User,
  Message,
  Conversation,
  Template,
  Call,
  CallPermission,
  CallQuality,
  CallLimit,
  SipConfig,
  Group,
  GroupParticipant,
  GroupJoinRequest,
  Website,
  ApiKey,
  ApiUsage,
  MessageLog,
  Contact,
  ContactLabel,
  AutoReplyRule,
  ProductCatalog,
  CommerceSettings,
  Order,
  Product,
  MarketingTemplate,
  MarketingCampaign,
  Account,
  AccountUser,
  Permission,
  RolePermission,
  AuditLog,
  ConversationalComponent,
};
