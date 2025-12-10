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
};
