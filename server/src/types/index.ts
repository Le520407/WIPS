export interface User {
  id: string;
  facebookId: string;
  name: string;
  email: string;
  accessToken?: string;
  whatsappBusinessAccountId?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  userId: string;
  conversationId: string;
  from: string;
  to: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'document' | 'template';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  language: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  components: TemplateComponent[];
  createdAt: Date;
}

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  text?: string;
  buttons?: TemplateButton[];
}

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phoneNumber?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  phoneNumber: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export interface WebhookEvent {
  object: string;
  entry: WebhookEntry[];
}

export interface WebhookEntry {
  id: string;
  changes: WebhookChange[];
}

export interface WebhookChange {
  value: {
    messaging_product: string;
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    messages?: WhatsAppMessage[];
    statuses?: MessageStatus[];
    calls?: WhatsAppCall[];
  };
  field: string;
}

export interface WhatsAppCall {
  id: string;
  from: string;
  to?: string;
  status: 'ringing' | 'connected' | 'ended' | 'missed' | 'rejected' | 'failed';
  timestamp: string;
  start_time?: string;
  end_time?: string;
  context?: string;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  video?: { id: string; mime_type: string; caption?: string };
  audio?: { id: string; mime_type: string };
  document?: { id: string; mime_type: string; filename?: string; caption?: string };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contacts?: Array<{
    name: { formatted_name: string; first_name?: string };
    phones?: Array<{ phone: string; type?: string }>;
  }>;
  sticker?: {
    id: string;
    mime_type: string;
    animated?: boolean;
  };
  reaction?: {
    message_id: string;
    emoji: string;
  };
  context?: {
    message_id: string;
  };
}

export interface MessageStatus {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
}
