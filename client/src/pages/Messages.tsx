import { useState, useEffect, useRef } from 'react';
import { Send, FileText, MessageSquare, Search, Zap, Plus, X, Check, CheckCheck } from 'lucide-react';
import { messageService, templateService } from '../services/api';

const Messages = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  
  // Template sending
  const [messageMode, setMessageMode] = useState<'text' | 'template' | 'media' | 'buttons' | 'list' | 'cta' | 'location'>('text');
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateVariables, setTemplateVariables] = useState<string[]>([]);
  
  // Interactive buttons
  const [buttonText, setButtonText] = useState('');
  const [buttons, setButtons] = useState<Array<{id: string, title: string}>>([
    { id: 'btn_1', title: '' },
    { id: 'btn_2', title: '' }
  ]);
  
  // Interactive list
  const [listBodyText, setListBodyText] = useState('');
  const [listButtonText, setListButtonText] = useState('View Options');
  const [listSections, setListSections] = useState<Array<{
    title: string,
    rows: Array<{id: string, title: string, description: string}>
  }>>([
    {
      title: 'Section 1',
      rows: [{ id: 'row_1', title: '', description: '' }]
    }
  ]);
  
  // Interactive CTA
  const [ctaBodyText, setCtaBodyText] = useState('');
  const [ctaButtonText, setCtaButtonText] = useState('Visit Website');
  const [ctaUrl, setCtaUrl] = useState('');
  
  // Location
  const [locationLatitude, setLocationLatitude] = useState('');
  const [locationLongitude, setLocationLongitude] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  
  // Media sending
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mediaCache, setMediaCache] = useState<{[key: string]: string}>({});
  const [mediaType, setMediaType] = useState<'image' | 'document' | 'video' | 'audio'>('image');
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [allConversations, setAllConversations] = useState<any[]>([]);
  
  // Quick Replies
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showAddReply, setShowAddReply] = useState(false);
  const [newQuickReply, setNewQuickReply] = useState('');
  
  // Refs for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);

  useEffect(() => {
    loadConversations();
    loadTemplates();
    loadQuickReplies();
  }, []);

  // Smart auto-scroll: only scroll if user is at bottom AND there are new messages
  useEffect(() => {
    const hasNewMessages = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (hasNewMessages && isUserAtBottom()) {
      scrollToBottom();
    }
  }, [messages]);

  // Auto-refresh messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    // Refresh messages every 3 seconds
    const interval = setInterval(() => {
      const conv = conversations.find(c => c.id === selectedConversation);
      if (conv) {
        refreshMessages(conv);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedConversation, conversations]);

  // Check if user is at the bottom of the messages container
  const isUserAtBottom = () => {
    if (!messagesContainerRef.current) return true; // Default to true if ref not available
    
    const container = messagesContainerRef.current;
    const threshold = 100; // pixels from bottom
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    
    return isAtBottom;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadQuickReplies = () => {
    const saved = localStorage.getItem('quick_replies');
    if (saved) {
      setQuickReplies(JSON.parse(saved));
    } else {
      // Default quick replies
      const defaults = [
        'Thank you for your message!',
        'I will get back to you shortly.',
        'Could you please provide more details?',
        'Your order has been confirmed.',
        'We appreciate your business!'
      ];
      setQuickReplies(defaults);
      localStorage.setItem('quick_replies', JSON.stringify(defaults));
    }
  };

  const handleAddQuickReply = () => {
    if (!newQuickReply.trim()) return;
    
    const updated = [...quickReplies, newQuickReply];
    setQuickReplies(updated);
    localStorage.setItem('quick_replies', JSON.stringify(updated));
    setNewQuickReply('');
    setShowAddReply(false);
  };

  const handleDeleteQuickReply = (index: number) => {
    const updated = quickReplies.filter((_, i) => i !== index);
    setQuickReplies(updated);
    localStorage.setItem('quick_replies', JSON.stringify(updated));
  };

  const handleUseQuickReply = (reply: string) => {
    setNewMessage(reply);
    setShowQuickReplies(false);
  };

  const loadConversations = () => {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    
    if (isDemoMode) {
      // Get read conversations from localStorage
      const readConversations = JSON.parse(localStorage.getItem('read_conversations') || '[]');
      
      // Demo mode: show simulated conversations
      const demoConversations = [
        {
          id: '1',
          phoneNumber: '+60105520735',
          lastMessage: 'Hello! How can I help you?',
          lastMessageTime: new Date().toISOString(),
          unreadCount: readConversations.includes('1') ? 0 : 2
        },
        {
          id: '2',
          phoneNumber: '+8613800138000',
          lastMessage: 'Thanks for your help!',
          lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
          unreadCount: readConversations.includes('2') ? 0 : 0  // Fixed: check if '2' is read
        },
        {
          id: '3',
          phoneNumber: '+14155552671',
          lastMessage: 'When will my order arrive?',
          lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
          unreadCount: readConversations.includes('3') ? 0 : 1
        }
      ];
      setConversations(demoConversations);
      setAllConversations(demoConversations);
    } else {
      messageService.getConversations()
        .then((data: any) => {
          setConversations(data.conversations);
          setAllConversations(data.conversations);
        })
        .catch((err: any) => console.error(err));
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setConversations(allConversations);
      return;
    }
    
    const filtered = allConversations.filter((conv: any) => 
      conv.phoneNumber.toLowerCase().includes(query.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(query.toLowerCase())
    );
    
    setConversations(filtered);
  };

  const loadTemplates = () => {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    
    if (isDemoMode) {
      // Demo mode: show simulated templates
      setTemplates([
        {
          id: '1',
          name: 'order_confirmation',
          language: 'zh_CN',
          category: 'UTILITY',
          status: 'APPROVED',
          body: '您好 {{1}}！您的订单 #{{2}} 已确认。金额：¥{{3}}。预计送达：{{4}}',
          variableCount: 4
        },
        {
          id: '2',
          name: 'shipping_notification',
          language: 'en',
          category: 'UTILITY',
          status: 'APPROVED',
          body: 'Hi {{1}}! Your order #{{2}} has been shipped. Tracking: {{3}}',
          variableCount: 3
        },
        {
          id: '3',
          name: 'welcome_message',
          language: 'en',
          category: 'MARKETING',
          status: 'APPROVED',
          body: 'Welcome {{1}}! Thanks for joining us. Use code {{2}} for 10% off!',
          variableCount: 2
        }
      ]);
    } else {
      templateService.getTemplates()
        .then((data: any) => setTemplates(data.templates))
        .catch((err: any) => console.error(err));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document' | 'video' | 'audio') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type based on media type
    let validTypes: string[] = [];
    let maxSize = 16 * 1024 * 1024; // Default 16MB
    
    switch (type) {
      case 'image':
        validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        maxSize = 5 * 1024 * 1024; // 5MB for images
        break;
      case 'document':
        validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                      'text/plain', 'text/csv'];
        maxSize = 100 * 1024 * 1024; // 100MB for documents
        break;
      case 'video':
        validTypes = ['video/mp4', 'video/3gpp'];
        maxSize = 16 * 1024 * 1024; // 16MB for videos
        break;
      case 'audio':
        validTypes = ['audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/amr', 'audio/ogg'];
        maxSize = 16 * 1024 * 1024; // 16MB for audio
        break;
    }

    if (!validTypes.includes(file.type)) {
      alert(`Please select a valid ${type} file`);
      return;
    }

    if (file.size > maxSize) {
      alert(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setSelectedFile(file);
    setMediaType(type);
    
    // Create preview for images only
    if (type === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setMediaCaption('');
  };

  const handleAddButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { id: `btn_${buttons.length + 1}`, title: '' }]);
    }
  };

  const handleRemoveButton = (index: number) => {
    if (buttons.length > 1) {
      setButtons(buttons.filter((_, i) => i !== index));
    }
  };

  const handleButtonTitleChange = (index: number, title: string) => {
    const newButtons = [...buttons];
    newButtons[index].title = title;
    setButtons(newButtons);
  };

  // List handlers
  const handleAddSection = () => {
    if (listSections.length < 10) {
      setListSections([...listSections, {
        title: `Section ${listSections.length + 1}`,
        rows: [{ id: `row_${Date.now()}`, title: '', description: '' }]
      }]);
    }
  };

  const handleRemoveSection = (sectionIndex: number) => {
    if (listSections.length > 1) {
      setListSections(listSections.filter((_, i) => i !== sectionIndex));
    }
  };

  const handleSectionTitleChange = (sectionIndex: number, title: string) => {
    const newSections = [...listSections];
    newSections[sectionIndex].title = title;
    setListSections(newSections);
  };

  const handleAddRow = (sectionIndex: number) => {
    const totalRows = listSections.reduce((sum, section) => sum + section.rows.length, 0);
    if (totalRows < 10) {
      const newSections = [...listSections];
      newSections[sectionIndex].rows.push({
        id: `row_${Date.now()}`,
        title: '',
        description: ''
      });
      setListSections(newSections);
    }
  };

  const handleRemoveRow = (sectionIndex: number, rowIndex: number) => {
    const newSections = [...listSections];
    if (newSections[sectionIndex].rows.length > 1) {
      newSections[sectionIndex].rows = newSections[sectionIndex].rows.filter((_, i) => i !== rowIndex);
      setListSections(newSections);
    }
  };

  const handleRowChange = (sectionIndex: number, rowIndex: number, field: 'title' | 'description', value: string) => {
    const newSections = [...listSections];
    newSections[sectionIndex].rows[rowIndex][field] = value;
    setListSections(newSections);
  };

  const handleSendMessage = async () => {
    if (!recipient) {
      alert('Please enter recipient number');
      return;
    }

    if (messageMode === 'text' && !newMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    if (messageMode === 'template' && !selectedTemplate) {
      alert('Please select a template');
      return;
    }

    if (messageMode === 'media' && !selectedFile) {
      alert('Please select a file to send');
      return;
    }

    if (messageMode === 'buttons' && !buttonText.trim()) {
      alert('Please enter button message text');
      return;
    }

    if (messageMode === 'buttons' && buttons.some(btn => !btn.title.trim())) {
      alert('Please fill in all button titles');
      return;
    }

    if (messageMode === 'list' && !listBodyText.trim()) {
      alert('Please enter list message text');
      return;
    }

    if (messageMode === 'list' && listSections.every(section => section.rows.every(row => !row.title.trim()))) {
      alert('Please add at least one list item');
      return;
    }

    if (messageMode === 'cta' && !ctaBodyText.trim()) {
      alert('Please enter CTA message text');
      return;
    }

    if (messageMode === 'cta' && !ctaUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    if (messageMode === 'cta' && !ctaUrl.match(/^https?:\/\/.+/)) {
      alert('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    if (messageMode === 'location' && (!locationLatitude || !locationLongitude)) {
      alert('Please enter latitude and longitude');
      return;
    }

    if (messageMode === 'location') {
      const lat = parseFloat(locationLatitude);
      const lng = parseFloat(locationLongitude);
      if (isNaN(lat) || isNaN(lng)) {
        alert('Latitude and longitude must be valid numbers');
        return;
      }
      if (lat < -90 || lat > 90) {
        alert('Latitude must be between -90 and 90');
        return;
      }
      if (lng < -180 || lng > 180) {
        alert('Longitude must be between -180 and 180');
        return;
      }
    }

    try {
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';
      
      if (isDemoMode) {
        let messageContent = '';
        let msgType: string = messageMode;
        let mediaUrl: string | null = null;
        
        if (messageMode === 'text') {
          messageContent = newMessage;
        } else if (messageMode === 'media') {
          messageContent = mediaCaption || '[Image]';
          msgType = 'image';
          mediaUrl = filePreview; // Use preview URL in demo mode
        } else {
          // Replace template variables
          messageContent = selectedTemplate.body;
          templateVariables.forEach((value, index) => {
            messageContent = messageContent.replace(`{{${index + 1}}}`, value || `[变量${index + 1}]`);
          });
        }
        
        // Add message to demo conversation
        const newMsg: any = {
          id: Date.now().toString(),
          content: messageContent,
          from: 'me',
          to: recipient,
          timestamp: new Date().toISOString(),
          status: 'sent',
          type: msgType,
          mediaUrl: mediaUrl
        };
        setMessages([...messages, newMsg]);
        setNewMessage('');
        setTemplateVariables([]);
        handleClearFile();
        
        // Simulate message status updates
        setTimeout(() => {
          setMessages(prev => prev.map(m => 
            m.id === newMsg.id ? { ...m, status: 'delivered' } : m
          ));
        }, 500);
        
        setTimeout(() => {
          setMessages(prev => prev.map(m => 
            m.id === newMsg.id ? { ...m, status: 'read' } : m
          ));
        }, 1500);
        
        // Simulate reply after 2 seconds
        setTimeout(() => {
          const reply = {
            id: (Date.now() + 1).toString(),
            content: 'Thanks for your message! This is a demo reply.',
            from: recipient,
            to: 'me',
            timestamp: new Date().toISOString(),
            status: 'received'
          };
          setMessages(prev => [...prev, reply]);
        }, 2000);
      } else {
        if (messageMode === 'text') {
          await messageService.sendMessage(recipient, newMessage);
          setNewMessage('');
        } else if (messageMode === 'media' && selectedFile) {
          setUploading(true);
          try {
            // Upload file first
            const uploadResult = await messageService.uploadMedia(selectedFile);
            // Send media message with media ID, type, caption, and filename
            await messageService.sendMediaMessage(
              recipient, 
              uploadResult.mediaId, 
              mediaType, 
              mediaCaption,
              selectedFile.name  // Pass the actual filename
            );
            handleClearFile();
          } finally {
            setUploading(false);
          }
        } else if (messageMode === 'buttons') {
          await messageService.sendInteractiveButtons(recipient, buttonText, buttons);
          setButtonText('');
          setButtons([{ id: 'btn_1', title: '' }, { id: 'btn_2', title: '' }]);
        } else if (messageMode === 'list') {
          await messageService.sendInteractiveList(recipient, listBodyText, listButtonText, listSections);
          setListBodyText('');
          setListButtonText('View Options');
          setListSections([{
            title: 'Section 1',
            rows: [{ id: 'row_1', title: '', description: '' }]
          }]);
        } else if (messageMode === 'cta') {
          await messageService.sendInteractiveCTA(recipient, ctaBodyText, ctaButtonText, ctaUrl);
          setCtaBodyText('');
          setCtaButtonText('Visit Website');
          setCtaUrl('');
        } else if (messageMode === 'location') {
          await messageService.sendLocation(
            recipient,
            parseFloat(locationLatitude),
            parseFloat(locationLongitude),
            locationName || undefined,
            locationAddress || undefined
          );
          setLocationLatitude('');
          setLocationLongitude('');
          setLocationName('');
          setLocationAddress('');
        } else {
          // Send template message
          alert('Template sending via real API not implemented yet');
        }
        
        // Reload messages for the current conversation instead of reloading the page
        if (selectedConversation) {
          // Reload messages for the selected conversation
          const conv = conversations.find(c => c.id === selectedConversation);
          if (conv) {
            handleSelectConversation(conv);
          }
        }
        
        alert('✅ Message sent successfully to WhatsApp!');
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('❌ Failed to send message. Check console for details.');
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    
    if (template) {
      // Initialize variable inputs
      const varCount = template.variableCount || 0;
      setTemplateVariables(new Array(varCount).fill(''));
    }
  };

  const handleVariableChange = (index: number, value: string) => {
    const newVariables = [...templateVariables];
    newVariables[index] = value;
    setTemplateVariables(newVariables);
  };

  const getTemplatePreview = () => {
    if (!selectedTemplate) return '';
    
    let preview = selectedTemplate.body;
    templateVariables.forEach((value, index) => {
      preview = preview.replace(`{{${index + 1}}}`, value || `[变量${index + 1}]`);
    });
    return preview;
  };

  // Function to refresh messages without changing conversation selection
  const refreshMessages = async (conv: any) => {
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    
    if (isDemoMode) {
      // In demo mode, don't auto-refresh to avoid disrupting the demo
      return;
    }
    
    // Real mode: Silently reload messages from API
    try {
      const data = await messageService.getMessages(conv.id);
      
      // Transform API messages to match frontend format
      const transformedMessages = await Promise.all(data.messages.map(async (msg: any) => {
        const isFromUs = msg.fromNumber === '803320889535856' || msg.toNumber === conv.phoneNumber;
        
        let mediaUrl = msg.mediaUrl;
        
        if (msg.mediaId && !mediaUrl && ['image', 'video', 'audio', 'document'].includes(msg.type)) {
          if (mediaCache[msg.mediaId]) {
            mediaUrl = mediaCache[msg.mediaId];
          } else {
            try {
              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
              const token = localStorage.getItem('token');
              const response = await fetch(`${apiUrl}/api/messages/media/${msg.mediaId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (response.ok) {
                const blob = await response.blob();
                mediaUrl = URL.createObjectURL(blob);
                setMediaCache(prev => ({ ...prev, [msg.mediaId]: mediaUrl }));
              }
            } catch (error) {
              console.error('Failed to fetch media:', error);
            }
          }
        }
        
        return {
          id: msg.id,
          content: msg.content,
          from: isFromUs ? 'me' : conv.phoneNumber,
          to: isFromUs ? conv.phoneNumber : 'me',
          timestamp: msg.createdAt,
          status: msg.status,
          type: msg.type,
          mediaUrl: mediaUrl,
          mediaId: msg.mediaId,
          caption: msg.caption
        };
      }));
      
      setMessages(transformedMessages);
    } catch (err) {
      console.error('Failed to refresh messages:', err);
    }
  };

  const handleSelectConversation = (conv: any) => {
    setSelectedConversation(conv.id);
    setRecipient(conv.phoneNumber);
    
    // Clear unread count when conversation is opened
    const updatedConversations = conversations.map((c: any) => 
      c.id === conv.id ? { ...c, unreadCount: 0 } : c
    );
    setConversations(updatedConversations);
    setAllConversations(updatedConversations);  // Also update allConversations
    
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    if (isDemoMode) {
      // Mark conversation as read in localStorage
      const readConversations = JSON.parse(localStorage.getItem('read_conversations') || '[]');
      if (!readConversations.includes(conv.id)) {
        readConversations.push(conv.id);
        localStorage.setItem('read_conversations', JSON.stringify(readConversations));
      }
      
      // Load demo messages for this conversation based on conversation ID
      let demoMessages: any[] = [];
      
      if (conv.id === '1') {
        // Conversation 1: +60105520735
        demoMessages = [
          {
            id: '1-1',
            content: 'Hi there!',
            from: conv.phoneNumber,
            to: 'me',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'received'
          },
          {
            id: '1-2',
            content: 'Hello! How can I help you?',
            from: 'me',
            to: conv.phoneNumber,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'read'
          }
        ];
      } else if (conv.id === '2') {
        // Conversation 2: +8613800138000
        demoMessages = [
          {
            id: '2-1',
            content: 'I need help with my order',
            from: conv.phoneNumber,
            to: 'me',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'received'
          },
          {
            id: '2-2',
            content: 'Sure! What\'s your order number?',
            from: 'me',
            to: conv.phoneNumber,
            timestamp: new Date(Date.now() - 5400000).toISOString(),
            status: 'read'
          },
          {
            id: '2-3',
            content: 'It\'s ORD-12345',
            from: conv.phoneNumber,
            to: 'me',
            timestamp: new Date(Date.now() - 4800000).toISOString(),
            status: 'received'
          },
          {
            id: '2-4',
            content: 'Thanks for your help!',
            from: conv.phoneNumber,
            to: 'me',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'received'
          }
        ];
      } else if (conv.id === '3') {
        // Conversation 3: +14155552671
        demoMessages = [
          {
            id: '3-1',
            content: 'Hello, I placed an order yesterday',
            from: conv.phoneNumber,
            to: 'me',
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            status: 'received'
          },
          {
            id: '3-2',
            content: 'Great! Your order is being processed.',
            from: 'me',
            to: conv.phoneNumber,
            timestamp: new Date(Date.now() - 9000000).toISOString(),
            status: 'read'
          },
          {
            id: '3-3',
            content: 'When will my order arrive?',
            from: conv.phoneNumber,
            to: 'me',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'received'
          }
        ];
      }
      
      setMessages(demoMessages);
      // Scroll to bottom when opening a conversation
      setTimeout(() => scrollToBottom(), 100);
    } else {
      // Real mode: Load messages from API
      messageService.getMessages(conv.id)
        .then(async (data: any) => {
          // Transform API messages to match frontend format
          const transformedMessages = await Promise.all(data.messages.map(async (msg: any) => {
            // If fromNumber is our WhatsApp number, it's from us
            const isFromUs = msg.fromNumber === '803320889535856' || msg.toNumber === conv.phoneNumber;
            
            let mediaUrl = msg.mediaUrl;
            
            // If message has mediaId but no mediaUrl, fetch it through our proxy
            if (msg.mediaId && !mediaUrl && ['image', 'video', 'audio', 'document'].includes(msg.type)) {
              // Check cache first
              if (mediaCache[msg.mediaId]) {
                mediaUrl = mediaCache[msg.mediaId];
              } else {
                try {
                  // Fetch media through our authenticated proxy
                  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
                  const token = localStorage.getItem('token');
                  const response = await fetch(`${apiUrl}/api/messages/media/${msg.mediaId}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  
                  if (response.ok) {
                    const blob = await response.blob();
                    mediaUrl = URL.createObjectURL(blob);
                    // Cache the blob URL
                    setMediaCache(prev => ({ ...prev, [msg.mediaId]: mediaUrl }));
                  }
                } catch (error) {
                  console.error('Failed to fetch media:', error);
                }
              }
            }
            
            return {
              id: msg.id,
              content: msg.content,
              from: isFromUs ? 'me' : conv.phoneNumber,
              to: isFromUs ? conv.phoneNumber : 'me',
              timestamp: msg.createdAt,
              status: msg.status,
              type: msg.type,
              mediaUrl: mediaUrl,
              mediaId: msg.mediaId,
              caption: msg.caption
            };
          }));
          setMessages(transformedMessages);
          // Scroll to bottom when opening a conversation
          setTimeout(() => scrollToBottom(), 100);
        })
        .catch((err: any) => {
          console.error('Failed to load messages:', err);
          setMessages([]);
        });
      
      // Mark conversation as read in real mode
      messageService.markConversationAsRead(conv.id)
        .catch((err: any) => console.error('Failed to mark as read:', err));
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-3">Conversations</h2>
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">No conversations</p>
          ) : (
            conversations.map((conv: any) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                  selectedConversation === conv.id ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium">{conv.phoneNumber}</p>
                  {conv.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white border-b">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-gray-500">Select a conversation or send a new message</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md rounded-lg overflow-hidden ${
                    msg.from === 'me' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-800 shadow'
                  }`}>
                    {/* Image Message */}
                    {msg.type === 'image' && msg.mediaUrl && (
                      <img 
                        src={msg.mediaUrl} 
                        alt="Shared image" 
                        className="w-full max-w-sm cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.mediaUrl, '_blank')}
                      />
                    )}
                    
                    {/* Video Message */}
                    {msg.type === 'video' && msg.mediaUrl && (
                      <video 
                        src={msg.mediaUrl} 
                        controls 
                        className="w-full max-w-sm"
                      />
                    )}
                    
                    {/* Audio Message */}
                    {msg.type === 'audio' && msg.mediaUrl && (
                      <div className="px-4 py-3">
                        <audio src={msg.mediaUrl} controls className="w-full" />
                      </div>
                    )}
                    
                    {/* Document Message */}
                    {msg.type === 'document' && (
                      <div className="px-4 py-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{msg.caption || 'Document'}</p>
                            <p className="text-xs text-gray-500">Click to download</p>
                          </div>
                          {msg.mediaUrl && (
                            <a 
                              href={msg.mediaUrl} 
                              download 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Text Content / Caption */}
                    {msg.content && msg.type !== 'document' && (
                      <div className="px-4 py-2">
                        <p>{msg.content}</p>
                      </div>
                    )}
                    
                    {/* Message Footer */}
                    <div className={`flex items-center justify-between px-4 pb-2 ${
                      msg.content ? '' : 'pt-2'
                    } ${
                      msg.from === 'me' ? 'text-green-100' : 'text-gray-400'
                    }`}>
                      <span className="text-xs">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                      {msg.from === 'me' && (
                        <span className="flex items-center ml-2">
                          {msg.status === 'sent' && <Check className="w-3 h-3" />}
                          {msg.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                          {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-300" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* Invisible element at the bottom for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t">
          {/* Recipient */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Recipient number (e.g., +60105520735)"
              value={recipient}
              onChange={(e: any) => setRecipient(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Message Mode Toggle */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <button
              onClick={() => {
                setMessageMode('text');
                setSelectedTemplate(null);
                setTemplateVariables([]);
                handleClearFile();
              }}
              className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                messageMode === 'text'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">Text</span>
            </button>
            <button
              onClick={() => {
                setMessageMode('media');
                setSelectedTemplate(null);
                setTemplateVariables([]);
              }}
              className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                messageMode === 'media'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">Media</span>
            </button>
            <button
              onClick={() => {
                setMessageMode('buttons');
                setSelectedTemplate(null);
                setTemplateVariables([]);
                handleClearFile();
              }}
              className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                messageMode === 'buttons'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
              <span className="text-xs">Buttons</span>
            </button>
            <button
              onClick={() => {
                setMessageMode('list');
                setSelectedTemplate(null);
                setTemplateVariables([]);
                handleClearFile();
              }}
              className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                messageMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="text-xs">List</span>
            </button>
            <button
              onClick={() => {
                setMessageMode('cta');
                setSelectedTemplate(null);
                setTemplateVariables([]);
                handleClearFile();
              }}
              className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                messageMode === 'cta'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-xs">CTA</span>
            </button>
            <button
              onClick={() => {
                setMessageMode('location');
                setSelectedTemplate(null);
                setTemplateVariables([]);
                handleClearFile();
              }}
              className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                messageMode === 'location'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs">Location</span>
            </button>
            <button
              onClick={() => setMessageMode('template')}
              className={`px-3 py-2 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                messageMode === 'template'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-xs">Template</span>
            </button>
          </div>

          {/* Text Message Mode */}
          {messageMode === 'text' && (
            <div className="space-y-3">
              {/* Quick Replies Toggle */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowQuickReplies(!showQuickReplies)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Quick Replies ({quickReplies.length})
                </button>
                <button
                  onClick={() => setShowAddReply(!showAddReply)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </div>

              {/* Add New Quick Reply */}
              {showAddReply && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">Add Quick Reply:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter your quick reply..."
                      value={newQuickReply}
                      onChange={(e) => setNewQuickReply(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddQuickReply()}
                      className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      onClick={handleAddQuickReply}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddReply(false);
                        setNewQuickReply('');
                      }}
                      className="px-3 py-2 text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Replies List */}
              {showQuickReplies && (
                <div className="p-3 bg-gray-50 rounded-lg border max-h-48 overflow-y-auto">
                  <p className="text-sm font-medium text-gray-700 mb-2">Select a quick reply:</p>
                  <div className="space-y-2">
                    {quickReplies.map((reply, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded hover:bg-blue-50 cursor-pointer group"
                        onClick={() => handleUseQuickReply(reply)}
                      >
                        <span className="text-sm text-gray-700 flex-1">{reply}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuickReply(index);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e: any) => setNewMessage(e.target.value)}
                  onKeyDown={(e: any) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Media Message Mode */}
          {messageMode === 'media' && (
            <div className="space-y-3">
              {/* Media Type Selector */}
              {!selectedFile && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <button
                    onClick={() => setMediaType('image')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      mediaType === 'image' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs">Image</p>
                  </button>
                  <button
                    onClick={() => setMediaType('document')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      mediaType === 'document' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs">Document</p>
                  </button>
                  <button
                    onClick={() => setMediaType('video')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      mediaType === 'video' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs">Video</p>
                  </button>
                  <button
                    onClick={() => setMediaType('audio')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      mediaType === 'audio' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <p className="text-xs">Audio</p>
                  </button>
                </div>
              )}

              {/* File Upload Area */}
              {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    accept={
                      mediaType === 'image' ? 'image/*' :
                      mediaType === 'document' ? '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv' :
                      mediaType === 'video' ? 'video/*' :
                      'audio/*'
                    }
                    onChange={(e) => handleFileSelect(e, mediaType)}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-gray-600 mb-1">Click to upload {mediaType}</p>
                    <p className="text-xs text-gray-400">
                      {mediaType === 'image' && 'JPEG, PNG, GIF, WebP (max 5MB)'}
                      {mediaType === 'document' && 'PDF, Word, Excel, PowerPoint (max 100MB)'}
                      {mediaType === 'video' && 'MP4, 3GPP (max 16MB)'}
                      {mediaType === 'audio' && 'AAC, MP3, AMR, OGG (max 16MB)'}
                    </p>
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* File Preview */}
                  <div className="relative border rounded-lg overflow-hidden bg-gray-50">
                    {mediaType === 'image' && filePreview ? (
                      <img 
                        src={filePreview} 
                        alt="Preview" 
                        className="w-full max-h-64 object-contain"
                      />
                    ) : (
                      <div className="p-8 text-center">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {mediaType === 'document' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          )}
                          {mediaType === 'video' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          )}
                          {mediaType === 'audio' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          )}
                        </svg>
                        <p className="text-gray-600 font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-400 mt-1">{mediaType.toUpperCase()} file ready to send</p>
                      </div>
                    )}
                    <button
                      onClick={handleClearFile}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Caption Input */}
                  <input
                    type="text"
                    placeholder="Add a caption (optional)"
                    value={mediaCaption}
                    onChange={(e) => setMediaCaption(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* File Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <span>{selectedFile.name}</span>
                    <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={uploading}
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Interactive Buttons Mode */}
          {messageMode === 'buttons' && (
            <div className="space-y-3">
              {/* Button Message Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Text
                </label>
                <textarea
                  placeholder="Enter your message text (e.g., Choose an option:)"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
                />
              </div>

              {/* Buttons */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Buttons ({buttons.length}/3)
                  </label>
                  {buttons.length < 3 && (
                    <button
                      onClick={handleAddButton}
                      className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Button
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  {buttons.map((button, index) => (
                    <div key={button.id} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Button ${index + 1} (max 20 chars)`}
                        value={button.title}
                        onChange={(e) => handleButtonTitleChange(index, e.target.value)}
                        maxLength={20}
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      {buttons.length > 1 && (
                        <button
                          onClick={() => handleRemoveButton(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {buttonText && buttons.some(btn => btn.title) && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <div className="bg-white rounded-lg shadow p-4 max-w-sm">
                    <p className="text-sm text-gray-800 mb-3">{buttonText}</p>
                    <div className="space-y-2">
                      {buttons.filter(btn => btn.title).map((button, index) => (
                        <button
                          key={index}
                          className="w-full px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                        >
                          {button.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!buttonText || buttons.every(btn => !btn.title)}
                className="w-full px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Interactive Buttons
              </button>
            </div>
          )}

          {/* Interactive List Mode */}
          {messageMode === 'list' && (
            <div className="space-y-3">
              {/* List Body Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Text
                </label>
                <textarea
                  placeholder="Enter your message (e.g., Please select an option:)"
                  value={listBodyText}
                  onChange={(e) => setListBodyText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
                />
              </div>

              {/* List Button Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text (max 20 chars)
                </label>
                <input
                  type="text"
                  placeholder="e.g., View Options"
                  value={listButtonText}
                  onChange={(e) => setListButtonText(e.target.value)}
                  maxLength={20}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Sections */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sections ({listSections.length}/10)
                  </label>
                  {listSections.length < 10 && (
                    <button
                      onClick={handleAddSection}
                      className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Section
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {listSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="p-4 border rounded-lg bg-gray-50">
                      {/* Section Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Section Title"
                          value={section.title}
                          onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                        />
                        {listSections.length > 1 && (
                          <button
                            onClick={() => handleRemoveSection(sectionIndex)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Rows */}
                      <div className="space-y-2">
                        {section.rows.map((row, rowIndex) => (
                          <div key={row.id} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                placeholder="Item title (max 24 chars)"
                                value={row.title}
                                onChange={(e) => handleRowChange(sectionIndex, rowIndex, 'title', e.target.value)}
                                maxLength={24}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Description (optional, max 72 chars)"
                                value={row.description}
                                onChange={(e) => handleRowChange(sectionIndex, rowIndex, 'description', e.target.value)}
                                maxLength={72}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              />
                            </div>
                            {section.rows.length > 1 && (
                              <button
                                onClick={() => handleRemoveRow(sectionIndex, rowIndex)}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add Row Button */}
                      {listSections.reduce((sum, s) => sum + s.rows.length, 0) < 10 && (
                        <button
                          onClick={() => handleAddRow(sectionIndex)}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Item
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {listBodyText && listSections.some(s => s.rows.some(r => r.title)) && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <div className="bg-white rounded-lg shadow p-4 max-w-sm">
                    <p className="text-sm text-gray-800 mb-3">{listBodyText}</p>
                    <button className="w-full px-4 py-2 border-2 border-indigo-500 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
                      {listButtonText}
                    </button>
                    <div className="mt-3 text-xs text-gray-500">
                      {listSections.filter(s => s.rows.some(r => r.title)).map((section, i) => (
                        <div key={i} className="mb-2">
                          <p className="font-medium">{section.title}</p>
                          <ul className="ml-3 mt-1">
                            {section.rows.filter(r => r.title).map((row, j) => (
                              <li key={j}>• {row.title}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!listBodyText || listSections.every(s => s.rows.every(r => !r.title))}
                className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Interactive List
              </button>
            </div>
          )}

          {/* Interactive CTA Mode */}
          {messageMode === 'cta' && (
            <div className="space-y-3">
              {/* CTA Body Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Text
                </label>
                <textarea
                  placeholder="Enter your message (e.g., Check out our latest products!)"
                  value={ctaBodyText}
                  onChange={(e) => setCtaBodyText(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-24"
                />
              </div>

              {/* CTA Button Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Button Text (max 20 chars)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Visit Website"
                  value={ctaButtonText}
                  onChange={(e) => setCtaButtonText(e.target.value)}
                  maxLength={20}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">{ctaButtonText.length}/20 characters</p>
              </div>

              {/* CTA URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">Must start with http:// or https://</p>
              </div>

              {/* Preview */}
              {ctaBodyText && ctaButtonText && ctaUrl && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <div className="bg-white rounded-lg shadow p-4 max-w-sm">
                    <p className="text-sm text-gray-800 mb-3">{ctaBodyText}</p>
                    <button className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {ctaButtonText}
                    </button>
                    <p className="text-xs text-gray-400 mt-2 truncate">{ctaUrl}</p>
                  </div>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!ctaBodyText || !ctaButtonText || !ctaUrl || !ctaUrl.match(/^https?:\/\/.+/)}
                className="w-full px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send CTA Button
              </button>
            </div>
          )}

          {/* Location Mode */}
          {messageMode === 'location' && (
            <div className="space-y-3">
              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g., 3.1390"
                    value={locationLatitude}
                    onChange={(e) => setLocationLatitude(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">-90 to 90</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g., 101.6869"
                    value={locationLongitude}
                    onChange={(e) => setLocationLongitude(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">-180 to 180</p>
                </div>
              </div>

              {/* Location Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Petronas Twin Towers"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Kuala Lumpur City Centre, Kuala Lumpur, Malaysia"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Helper Text */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 font-medium mb-1">💡 How to get coordinates:</p>
                <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                  <li>Google Maps: Right-click on a location → Click coordinates to copy</li>
                  <li>Format: First number is latitude, second is longitude</li>
                  <li>Example: Kuala Lumpur = 3.1390, 101.6869</li>
                </ul>
              </div>

              {/* Preview */}
              {locationLatitude && locationLongitude && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <div className="bg-white rounded-lg shadow p-4 max-w-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 rounded-full">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        {locationName && (
                          <p className="font-medium text-gray-900 mb-1">{locationName}</p>
                        )}
                        {locationAddress && (
                          <p className="text-sm text-gray-600 mb-2">{locationAddress}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {locationLatitude}, {locationLongitude}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!locationLatitude || !locationLongitude}
                className="w-full px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Location
              </button>
            </div>
          )}

          {/* Template Message Mode */}
          {messageMode === 'template' && (
            <div className="space-y-3">
              {/* Template Selector */}
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a template...</option>
                {templates
                  .filter(t => t.status === 'APPROVED')
                  .map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.language})
                    </option>
                  ))}
              </select>

              {/* Variable Inputs */}
              {selectedTemplate && templateVariables.length > 0 && (
                <div className="space-y-2 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">Fill in variables:</p>
                  {templateVariables.map((value, index) => (
                    <input
                      key={index}
                      type="text"
                      placeholder={`Variable ${index + 1}`}
                      value={value}
                      onChange={(e) => handleVariableChange(index, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ))}
                </div>
              )}

              {/* Template Preview */}
              {selectedTemplate && (
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{getTemplatePreview()}</p>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!selectedTemplate}
                className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
