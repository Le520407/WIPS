import { useState, useEffect, useRef } from 'react';
import { Send, FileText, MessageSquare, Search, Zap, Plus, X, Check, CheckCheck } from 'lucide-react';
import { messageService, templateService } from '../services/api';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { VoiceMessage } from '../components/VoiceMessage';
import '../styles/Messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  
  // Template sending
  const [messageMode, setMessageMode] = useState<'text' | 'template' | 'media' | 'buttons' | 'list' | 'cta' | 'location' | 'contact' | 'sticker' | 'location_request' | 'address' | 'media_carousel' | 'product_carousel'>('text');
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
  
  // Contact
  const [contactName, setContactName] = useState('');
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  
  // Sticker
  const [stickerUrl, setStickerUrl] = useState('');
  
  // Location Request
  const [locationRequestText, setLocationRequestText] = useState('');
  
  // Address
  const [addressName, setAddressName] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [addressCountry, setAddressCountry] = useState('');
  const [addressType, setAddressType] = useState('HOME');
  
  // Media Carousel
  const [carouselBodyText, setCarouselBodyText] = useState('');
  const [carouselCards, setCarouselCards] = useState<Array<{
    cardIndex: number;
    headerType: 'image' | 'video';
    mediaLink: string;
    bodyText: string;
    buttonText: string;
    buttonUrl: string;
  }>>([
    {
      cardIndex: 0,
      headerType: 'image',
      mediaLink: '',
      bodyText: '',
      buttonText: '',
      buttonUrl: ''
    },
    {
      cardIndex: 1,
      headerType: 'image',
      mediaLink: '',
      bodyText: '',
      buttonText: '',
      buttonUrl: ''
    }
  ]);
  
  // Product Carousel
  const [productCarouselBodyText, setProductCarouselBodyText] = useState('');
  const [catalogId, setCatalogId] = useState('');
  const [productCards, setProductCards] = useState<Array<{
    cardIndex: number;
    productRetailerId: string;
  }>>([
    {
      cardIndex: 0,
      productRetailerId: ''
    },
    {
      cardIndex: 1,
      productRetailerId: ''
    }
  ]);
  
  // Media sending
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mediaCache, setMediaCache] = useState<{[key: string]: string}>({});
  const [mediaType, setMediaType] = useState<'image' | 'document' | 'video' | 'audio' | 'voice'>('image');
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [allConversations, setAllConversations] = useState<any[]>([]);
  
  // Quick Replies
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showAddReply, setShowAddReply] = useState(false);
  const [newQuickReply, setNewQuickReply] = useState('');
  
  // Reply/Quote functionality
  const [replyingTo, setReplyingTo] = useState<any>(null);
  
  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Reaction menu
  const [showReactionMenu, setShowReactionMenu] = useState<string | null>(null);
  
  // Refs for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);
  const lastMessageIdRef = useRef<string | null>(null);
  
  // Typing indicator
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef<boolean>(false);
  const lastIncomingMessageIdRef = useRef<string | null>(null);

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

  // Auto-refresh conversations list every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    // Refresh messages every 5 seconds (increased to reduce unnecessary re-renders)
    const interval = setInterval(() => {
      const conv = conversations.find(c => c.id === selectedConversation);
      if (conv) {
        refreshMessages(conv);
      }
    }, 5000);

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
          // Preserve the unread count for the currently selected conversation
          const updatedConversations = data.conversations.map((conv: any) => {
            if (conv.id === selectedConversation) {
              return { ...conv, unreadCount: 0 };
            }
            return conv;
          });
          
          setConversations(updatedConversations);
          setAllConversations(updatedConversations);
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
          body: 'Hello {{1}}! Your order #{{2}} has been confirmed. Amount: ${{3}}. Estimated delivery: {{4}}',
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

  // Media Carousel handlers
  const handleAddCarouselCard = () => {
    if (carouselCards.length < 10) {
      setCarouselCards([...carouselCards, {
        cardIndex: carouselCards.length,
        headerType: carouselCards[0]?.headerType || 'image',
        mediaLink: '',
        bodyText: '',
        buttonText: '',
        buttonUrl: ''
      }]);
    }
  };

  const handleRemoveCarouselCard = (index: number) => {
    if (carouselCards.length > 2) {
      const newCards = carouselCards.filter((_, i) => i !== index);
      // Re-index cards
      newCards.forEach((card, i) => card.cardIndex = i);
      setCarouselCards(newCards);
    }
  };

  const handleCarouselCardChange = (index: number, field: string, value: any) => {
    const newCards = [...carouselCards];
    (newCards[index] as any)[field] = value;
    
    // If changing header type, update all cards to match
    if (field === 'headerType') {
      newCards.forEach(card => card.headerType = value);
    }
    
    setCarouselCards(newCards);
  };

  // Product Carousel handlers
  const handleAddProductCard = () => {
    if (productCards.length < 10) {
      setProductCards([...productCards, {
        cardIndex: productCards.length,
        productRetailerId: ''
      }]);
    }
  };

  const handleRemoveProductCard = (index: number) => {
    if (productCards.length > 2) {
      const newCards = productCards.filter((_, i) => i !== index);
      // Re-index cards
      newCards.forEach((card, i) => card.cardIndex = i);
      setProductCards(newCards);
    }
  };

  const handleProductCardChange = (index: number, value: string) => {
    const newCards = [...productCards];
    newCards[index].productRetailerId = value;
    setProductCards(newCards);
  };

  // Voice recording functions - DISABLED
  // Reason: Browser WebM format not compatible with WhatsApp
  // Solution: Use Audio type with OGG files uploaded via URL or file
  /*
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // WhatsApp supported formats (from official docs):
      // ✅ audio/ogg (OPUS codec only) - Voice message standard
      // ✅ audio/mp4 (AAC) - Safari ONLY
      // ❌ audio/webm - NOT SUPPORTED by WhatsApp!
      
      // CRITICAL: Chrome claims to support MP4 but generates invalid files!
      // We must use WebM (Chrome's native format) and convert on server
      
      let mimeType = 'audio/webm;codecs=opus'; // Chrome's native format
      
      // Check if browser supports WebM with Opus
      if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        // Fallback to plain WebM
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else {
          console.error('❌ Browser does not support audio recording!');
          alert('Your browser does not support audio recording.');
          stream.getTracks().forEach(track => track.stop());
          return;
        }
      }
      
      console.log('🎤 Recording with format:', mimeType);
      console.log('⚠️  Note: WebM will be converted to OGG on server for WhatsApp compatibility');
      
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        
        // Always use .webm extension for WebM files
        const file = new File([blob], `voice_${Date.now()}.webm`, { type: mimeType });
        
        console.log('🎤 Recording complete:', {
          size: file.size,
          type: file.type,
          name: file.name,
          sizeKB: (file.size / 1024).toFixed(2) + ' KB'
        });
        
        // Check file size limits
        if (file.size > 16 * 1024 * 1024) {
          alert('Recording file is too large (over 16MB). Please record a shorter message.');
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        if (file.size > 512 * 1024) {
          console.warn('⚠️ File size > 512KB - user will see download icon instead of play icon');
        }
        
        console.log('📤 File will be converted to OGG on server before sending to WhatsApp');
        
        setSelectedFile(file);
        setFilePreview(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Store timer ID for cleanup
      (recorder as any).timerId = timer;
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Cannot access microphone. Please ensure microphone permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      clearInterval((mediaRecorder as any).timerId);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordingTime(0);
      clearInterval((mediaRecorder as any).timerId);
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  */

  // Handle typing indicator
  const handleTyping = () => {
    if (!recipient) return;
    
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    if (isDemoMode) return; // Skip in demo mode
    
    // Need a message_id from an incoming message to show typing indicator
    if (!lastIncomingMessageIdRef.current) {
      console.log('⚠️ No incoming message ID available for typing indicator');
      return;
    }
    
    // Send typing indicator if not already typing
    if (!isTypingRef.current) {
      messageService.sendTypingIndicator(recipient, lastIncomingMessageIdRef.current)
        .then(() => {
          console.log('✅ Typing indicator sent');
          isTypingRef.current = true;
        })
        .catch(err => {
          console.error('Failed to send typing indicator:', err);
          // If it fails, clear the message ID (might be expired)
          lastIncomingMessageIdRef.current = null;
        });
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Reset typing flag after 3 seconds of inactivity
    // (The indicator will auto-clear after 25 seconds on WhatsApp side)
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 3000);
  };

  const handleSendReaction = async (messageId: string, emoji: string) => {
    try {
      if (!selectedConversation) return;
      
      const conv = conversations.find(c => c.id === selectedConversation);
      if (!conv) return;

      // Use phoneNumber (camelCase) for demo mode, phone_number (snake_case) for real mode
      const phoneNumber = conv.phoneNumber || conv.phone_number;
      if (!phoneNumber) {
        console.error('No phone number found in conversation:', conv);
        alert('Failed to send reaction: No phone number found');
        return;
      }

      await messageService.sendReaction(phoneNumber, messageId, emoji);
      setShowReactionMenu(null);
      
      // Refresh messages
      await refreshMessages(conv);
    } catch (error: any) {
      console.error('Send reaction error:', error);
      alert('Failed to send reaction: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleSendMessage = async () => {
    // Reset typing flag when sending (indicator will auto-clear on WhatsApp side)
    if (isTypingRef.current) {
      isTypingRef.current = false;
    }
    
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

    if (messageMode === 'contact' && !contactName.trim()) {
      alert('Please enter contact name');
      return;
    }

    if (messageMode === 'contact' && !contactPhone.trim()) {
      alert('Please enter at least one phone number');
      return;
    }

    if (messageMode === 'sticker' && !stickerUrl.trim()) {
      alert('Please enter a sticker URL');
      return;
    }

    if (messageMode === 'sticker' && !stickerUrl.match(/^https?:\/\/.+/)) {
      alert('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    if (messageMode === 'location_request' && !locationRequestText.trim()) {
      alert('Please enter request message text');
      return;
    }

    if (messageMode === 'address') {
      if (!addressName.trim() || !addressStreet.trim() || !addressCity.trim() || !addressCountry.trim()) {
        alert('Please fill in all required address fields (Name, Street, City, Country)');
        return;
      }
    }

    try{
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
            messageContent = messageContent.replace(`{{${index + 1}}}`, value || `[Variable ${index + 1}]`);
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
          // Check if replying to a message
          if (replyingTo && replyingTo.messageId && replyingTo.messageId.startsWith('wamid.')) {
            // Send as contextual reply using WhatsApp message ID
            console.log('Sending reply to message:', replyingTo.messageId);
            await messageService.sendReply(recipient, newMessage, replyingTo.messageId);
          } else {
            // Send as normal text message
            await messageService.sendMessage(recipient, newMessage);
          }
          setNewMessage('');
          setReplyingTo(null); // Clear reply state
        } else if (messageMode === 'media' && selectedFile) {
          setUploading(true);
          try {
            // Upload file first
            const uploadResult = await messageService.uploadMedia(selectedFile);
            
            // Send media message with media ID, type, caption, filename, and optional context
            // Voice type will be handled by backend (converts to audio with voice: true)
            await messageService.sendMediaMessage(
              recipient, 
              uploadResult.mediaId, 
              mediaType,  // Send actual type (including 'voice')
              mediaCaption,
              selectedFile.name,  // Pass the actual filename
              replyingTo?.messageId  // Pass context if replying
            );
            handleClearFile();
            setReplyingTo(null); // Clear reply state
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
        } else if (messageMode === 'contact') {
          const contacts = [{
            name: {
              formatted_name: contactName,
              first_name: contactFirstName || undefined,
              last_name: contactLastName || undefined
            },
            phones: contactPhone ? [{
              phone: contactPhone,
              type: 'MOBILE'
            }] : undefined,
            emails: contactEmail ? [{
              email: contactEmail,
              type: 'WORK'
            }] : undefined,
            org: (contactCompany || contactTitle) ? {
              company: contactCompany || undefined,
              title: contactTitle || undefined
            } : undefined
          }];
          await messageService.sendContact(recipient, contacts);
          setContactName('');
          setContactFirstName('');
          setContactLastName('');
          setContactPhone('');
          setContactEmail('');
          setContactCompany('');
          setContactTitle('');
        } else if (messageMode === 'sticker') {
          await messageService.sendSticker(recipient, undefined, stickerUrl, replyingTo?.messageId);
          setStickerUrl('');
          setReplyingTo(null); // Clear reply state
        } else if (messageMode === 'location_request') {
          await messageService.requestLocation(recipient, locationRequestText);
          setLocationRequestText('');
        } else if (messageMode === 'address') {
          const address = {
            street: addressStreet,
            city: addressCity,
            state: addressState || undefined,
            zip: addressZip || undefined,
            country: addressCountry,
            type: addressType
          };
          await messageService.sendAddress(recipient, addressName, address);
          setAddressName('');
          setAddressStreet('');
          setAddressCity('');
          setAddressState('');
          setAddressZip('');
          setAddressCountry('');
          setAddressType('HOME');
        } else if (messageMode === 'media_carousel') {
          await messageService.sendMediaCarousel(recipient, carouselBodyText, carouselCards);
          setCarouselBodyText('');
          setCarouselCards([
            {
              cardIndex: 0,
              headerType: 'image',
              mediaLink: '',
              bodyText: '',
              buttonText: '',
              buttonUrl: ''
            },
            {
              cardIndex: 1,
              headerType: 'image',
              mediaLink: '',
              bodyText: '',
              buttonText: '',
              buttonUrl: ''
            }
          ]);
        } else if (messageMode === 'product_carousel') {
          await messageService.sendProductCarousel(recipient, productCarouselBodyText, catalogId, productCards);
          setProductCarouselBodyText('');
          setCatalogId('');
          setProductCards([
            {
              cardIndex: 0,
              productRetailerId: ''
            },
            {
              cardIndex: 1,
              productRetailerId: ''
            }
          ]);
        } else {
          // Send template message
          const components = [];
          
          // Add body parameters if there are variables
          if (templateVariables.length > 0) {
            components.push({
              type: 'body',
              parameters: templateVariables.map(value => ({
                type: 'text',
                text: value
              }))
            });
          }
          
          await templateService.sendTemplate(
            recipient,
            selectedTemplate.name,
            selectedTemplate.language,
            components.length > 0 ? components : undefined
          );
          
          setSelectedTemplate(null);
          setTemplateVariables([]);
        }
        
        // Reload conversations list to update last message
        loadConversations();
        
        // Reload messages for the current conversation instead of reloading the page
        if (selectedConversation) {
          // Reload messages for the selected conversation
          const conv = conversations.find(c => c.id === selectedConversation);
          if (conv) {
            // Wait a bit for the message to be saved in the database
            setTimeout(() => {
              refreshMessages(conv);
            }, 500);
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
      // Calculate variable count from template body or components
      let varCount = 0;
      
      // Try to get body text from different possible structures
      let bodyText = '';
      if (template.body) {
        bodyText = template.body;
      } else if (template.components) {
        const bodyComponent = template.components.find((c: any) => c.type === 'BODY');
        if (bodyComponent) {
          bodyText = bodyComponent.text || '';
        }
      }
      
      // Count parameters in the body text ({{1}}, {{2}}, etc.)
      if (bodyText) {
        const matches = bodyText.match(/\{\{\d+\}\}/g);
        varCount = matches ? matches.length : 0;
      }
      
      console.log(`📝 Template "${template.name}" has ${varCount} parameter(s)`);
      
      // Initialize variable inputs
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
    
    // Get body text from different possible structures
    let bodyText = '';
    if (selectedTemplate.body) {
      bodyText = selectedTemplate.body;
    } else if (selectedTemplate.components) {
      const bodyComponent = selectedTemplate.components.find((c: any) => c.type === 'BODY');
      if (bodyComponent) {
        bodyText = bodyComponent.text || '';
      }
    }
    
    // Replace variables with values
    let preview = bodyText;
    templateVariables.forEach((value, index) => {
      preview = preview.replace(`{{${index + 1}}}`, value || `[Variable ${index + 1}]`);
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
      
      // Always update messages to ensure new messages are displayed
      // Find the last message we sent (not received)
      const sentMessages = data.messages.filter((msg: any) => msg.fromNumber === '803320889535856');
      const lastSentMsg = sentMessages[sentMessages.length - 1];
      
      console.log('Refreshing messages:', {
        totalMessages: data.messages.length,
        sentMessages: sentMessages.length,
        lastSentMsg: lastSentMsg ? {
          content: lastSentMsg.content?.substring(0, 30),
          status: lastSentMsg.status,
          to: lastSentMsg.toNumber
        } : 'No sent messages'
      });
      
      // Transform API messages to match frontend format
      const transformedMessages = await Promise.all(data.messages.map(async (msg: any) => {
        const isFromUs = msg.fromNumber === '803320889535856';
        
        let mediaUrl = msg.mediaUrl;
        
        if (msg.mediaId && !mediaUrl && ['image', 'video', 'audio', 'document', 'sticker'].includes(msg.type)) {
          if (mediaCache[msg.mediaId]) {
            mediaUrl = mediaCache[msg.mediaId];
          } else {
            try {
              const apiUrl = import.meta.env.VITE_API_URL || '';
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
        
        const transformed = {
          id: msg.id,
          messageId: msg.messageId, // WhatsApp message ID (wamid.xxx)
          content: msg.content,
          from: isFromUs ? 'me' : conv.phoneNumber,
          to: isFromUs ? conv.phoneNumber : 'me',
          timestamp: msg.createdAt,
          status: msg.status,
          type: msg.type,
          mediaUrl: mediaUrl,
          mediaId: msg.mediaId,
          caption: msg.caption,
          contextMessageId: msg.contextMessageId,
          contextMessageContent: msg.contextMessageContent,
          contextMessageType: msg.contextMessageType,
          contextMessageMediaUrl: msg.contextMessageMediaUrl,
          reactionEmoji: msg.reactionEmoji,
          reactionMessageId: msg.reactionMessageId
        };
        
        // Debug: Log messages with reactions
        if (msg.reactionEmoji) {
          console.log('📨 Message with reaction (refreshMessages):', {
            id: msg.id,
            type: msg.type,
            content: msg.content?.substring(0, 30),
            reactionEmoji: msg.reactionEmoji,
            fromAPI: msg.reactionEmoji,
            afterTransform: transformed.reactionEmoji,
            willShowBadge: msg.reactionEmoji && msg.type !== 'reaction'
          });
        }
        
        return transformed;
      }));
      
      console.log('Setting messages:', {
        count: transformedMessages.length,
        lastMsg: transformedMessages[transformedMessages.length - 1]?.content?.substring(0, 30),
        messagesWithReactions: transformedMessages.filter(m => m.reactionEmoji).length,
        textMessagesWithReactions: transformedMessages.filter(m => m.reactionEmoji && m.type !== 'reaction').length,
        reactionMessages: transformedMessages.filter(m => m.type === 'reaction').length
      });
      
      // Log last 5 messages for debugging
      console.log('📋 Last 5 messages:', transformedMessages.slice(-5).map(m => ({
        id: m.id.substring(0, 8),
        type: m.type,
        content: m.content?.substring(0, 20),
        reactionEmoji: m.reactionEmoji,
        from: m.from === 'me' ? 'me' : 'customer'
      })));
      
      // Update messages
      setMessages(transformedMessages);
      
      // Update last incoming message ID for typing indicator
      const incomingMessages = transformedMessages.filter((msg: any) => msg.from !== 'me');
      if (incomingMessages.length > 0) {
        const lastIncoming = incomingMessages[incomingMessages.length - 1];
        if (lastIncoming.messageId) {
          lastIncomingMessageIdRef.current = lastIncoming.messageId;
        }
      }
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
      // Update the last message ID ref
      if (demoMessages.length > 0) {
        lastMessageIdRef.current = demoMessages[demoMessages.length - 1].id;
      }
      // Scroll to bottom when opening a conversation
      setTimeout(() => scrollToBottom(), 100);
    } else {
      // Real mode: Load messages from API
      messageService.getMessages(conv.id)
        .then(async (data: any) => {
          // Transform API messages to match frontend format
          console.log('📊 Received messages from API:', data.messages.length);
          
          const transformedMessages = await Promise.all(data.messages.map(async (msg: any) => {
            // If fromNumber is our WhatsApp number, it's from us
            const isFromUs = msg.fromNumber === '803320889535856';
            
            let mediaUrl = msg.mediaUrl;
            
            // If message has mediaId but no mediaUrl, fetch it through our proxy
            if (msg.mediaId && !mediaUrl && ['image', 'video', 'audio', 'document', 'sticker'].includes(msg.type)) {
              // Check cache first
              if (mediaCache[msg.mediaId]) {
                mediaUrl = mediaCache[msg.mediaId];
              } else {
                try {
                  // Fetch media through our authenticated proxy
                  const apiUrl = import.meta.env.VITE_API_URL || '';
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
              messageId: msg.messageId, // WhatsApp message ID (wamid.xxx)
              content: msg.content,
              from: isFromUs ? 'me' : conv.phoneNumber,
              to: isFromUs ? conv.phoneNumber : 'me',
              timestamp: msg.createdAt,
              status: msg.status,
              type: msg.type,
              mediaUrl: mediaUrl,
              mediaId: msg.mediaId,
              caption: msg.caption,
              contextMessageId: msg.contextMessageId,
              contextMessageContent: msg.contextMessageContent,
              contextMessageType: msg.contextMessageType,
              contextMessageMediaUrl: msg.contextMessageMediaUrl,
              reactionEmoji: msg.reactionEmoji,
              reactionMessageId: msg.reactionMessageId
            };
          }));
          
          // Debug: Check for reaction messages
          const reactionMessages = transformedMessages.filter((m: any) => m.type === 'reaction');
          console.log('🎯 Reaction type messages:', reactionMessages.length);
          if (reactionMessages.length > 0) {
            console.log('🎯 Sample reaction message:', reactionMessages[0]);
          }
          
          setMessages(transformedMessages);
          // Update the last message ID ref
          if (transformedMessages.length > 0) {
            lastMessageIdRef.current = transformedMessages[transformedMessages.length - 1].id;
          }
          
          // Update last incoming message ID for typing indicator
          // Find the most recent message from the user (not from us)
          const incomingMessages = transformedMessages.filter((msg: any) => msg.from !== 'me');
          if (incomingMessages.length > 0) {
            const lastIncoming = incomingMessages[incomingMessages.length - 1];
            // Use the WhatsApp message ID (messageId field, starts with 'wamid.')
            if (lastIncoming.messageId) {
              lastIncomingMessageIdRef.current = lastIncoming.messageId;
              console.log('📨 Last incoming message ID for typing indicator:', lastIncoming.messageId);
            }
          }
          // Scroll to bottom when opening a conversation
          setTimeout(() => scrollToBottom(), 100);
          
          // Auto-mark received messages as read (Smart version - only latest message)
          console.log('🔍 Checking for messages to mark as read...');
          console.log('Total messages:', transformedMessages.length);
          
          const receivedMessages = transformedMessages.filter((msg: any) => 
            msg.from !== 'me' && msg.status !== 'read'
          );
          
          console.log('Unread received messages:', receivedMessages.length);
          
          // Mark only the most recent message as read to avoid API errors
          if (receivedMessages.length > 0) {
            const latestMessage = receivedMessages[receivedMessages.length - 1];
            console.log('Latest unread message:', {
              id: latestMessage.id,
              messageId: latestMessage.messageId,
              content: latestMessage.content?.substring(0, 30),
              status: latestMessage.status,
              from: latestMessage.from
            });
            
            // Only mark if it has a valid WhatsApp message ID
            if (latestMessage.messageId && latestMessage.messageId.startsWith('wamid.')) {
              console.log('📨 Attempting to mark as read:', latestMessage.messageId);
              
              messageService.markAsRead(latestMessage.messageId)
                .then(() => {
                  console.log('✅ Successfully marked message as read!');
                  // Update local message status
                  setMessages(prev => prev.map(m => 
                    m.messageId === latestMessage.messageId ? { ...m, status: 'read' } : m
                  ));
                })
                .catch((err: any) => {
                  // Log error for debugging
                  console.error('❌ Failed to mark as read:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message
                  });
                });
            } else {
              console.warn('⚠️ Cannot mark as read - invalid message ID:', latestMessage.messageId);
            }
          } else {
            console.log('ℹ️ No unread messages to mark');
          }
        })
        .catch((err: any) => {
          console.error('Failed to load messages:', err);
          setMessages([]);
          lastMessageIdRef.current = null;
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
                className={`conversation-item ${
                  selectedConversation === conv.id ? 'active' : ''
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

        <div ref={messagesContainerRef} className="messages-container flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-gray-500">Select a conversation or send a new message</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'} group`}>
                  <div className="flex items-start gap-2">
                    <div className={`max-w-xs lg:max-w-md rounded-lg overflow-hidden ${
                      msg.from === 'me' 
                        ? 'message-bubble-sent' 
                        : 'message-bubble-received'
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
                    
                    {/* Audio/Voice Message */}
                    {(msg.type === 'audio' || msg.type === 'voice') && (
                      <VoiceMessage
                        mediaUrl={msg.mediaUrl}
                        mediaId={msg.mediaId}
                        isSent={msg.from === 'me'}
                      />
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
                    
                    {/* Location Message */}
                    {msg.type === 'location' && (
                      <div className="px-4 py-3">
                        <div className="bg-gray-100 rounded-lg overflow-hidden">
                          {(() => {
                            // Extract coordinates from content
                            const match = msg.content.match(/Location: ([-\d.]+), ([-\d.]+)/);
                            if (match) {
                              const lat = match[1];
                              const lng = match[2];
                              const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                              const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x200&markers=color:red%7C${lat},${lng}&key=YOUR_API_KEY`;
                              
                              return (
                                <>
                                  {/* Map Preview - Click to open in Google Maps */}
                                  <a 
                                    href={googleMapsUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block hover:opacity-90 transition-opacity relative group"
                                  >
                                    <div className="w-full h-48 bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
                                      {/* Background pattern */}
                                      <div className="absolute inset-0 opacity-10">
                                        <div className="absolute inset-0" style={{
                                          backgroundImage: 'radial-gradient(circle at 2px 2px, #ef4444 1px, transparent 0)',
                                          backgroundSize: '40px 40px'
                                        }}></div>
                                      </div>
                                      
                                      {/* Content */}
                                      <div className="relative text-center z-10">
                                        <div className="w-16 h-16 mx-auto mb-3 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                          </svg>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">📍 Location Shared</p>
                                        <p className="text-xs text-gray-500 mt-1">{lat}, {lng}</p>
                                        <div className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-full shadow text-xs text-blue-600 font-medium group-hover:bg-blue-50 transition-colors">
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                          Click to view map
                                        </div>
                                      </div>
                                    </div>
                                  </a>
                                  <div className="p-3">
                                    <div className="flex items-start gap-2">
                                      <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-sm text-gray-900">📍 Location</p>
                                        <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">{msg.content}</p>
                                        <a 
                                          href={googleMapsUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                          Open in Google Maps
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              );
                            }
                            
                            // Fallback if no coordinates found
                            return (
                              <div className="p-3">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-red-100 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-900">📍 Location</p>
                                    <p className="text-xs text-gray-600 mt-1">{msg.content}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {/* Contact Message */}
                    {msg.type === 'contacts' && (
                      <div className="px-4 py-3">
                        <div className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg">
                          <div className="p-2 bg-cyan-100 rounded-full">
                            <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">👤 Contact</p>
                            <p className="text-xs text-gray-600 mt-1">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Interactive Message (Buttons/List/CTA/Location Request) */}
                    {msg.type === 'interactive' && (
                      <div className="px-4 py-3">
                        {msg.content.includes('[LOCATION REQUEST]') ? (
                          // Location Request Message
                          <div className="flex items-start gap-2 p-3 bg-pink-50 rounded-lg border border-pink-200">
                            <svg className="w-5 h-5 text-pink-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm text-pink-900 font-medium">📍 Location Request</p>
                              <p className="text-xs text-pink-700 mt-1">{msg.content.replace('[LOCATION REQUEST] ', '')}</p>
                              <p className="text-xs text-pink-600 mt-1 italic">User will see a "Share Location" button in WhatsApp</p>
                            </div>
                          </div>
                        ) : (
                          // Other Interactive Messages
                          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm text-blue-900 font-medium">Interactive Message</p>
                              <p className="text-xs text-blue-700 mt-1">{msg.content}</p>
                              <p className="text-xs text-blue-600 mt-1 italic">View in WhatsApp for full interaction</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Sticker Message */}
                    {msg.type === 'sticker' && msg.mediaUrl && (
                      <div className="p-2">
                        <img 
                          src={msg.mediaUrl} 
                          alt="Sticker" 
                          className="w-32 h-32 object-contain cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => window.open(msg.mediaUrl, '_blank')}
                        />
                      </div>
                    )}
                    
                    {/* Reaction Message */}
                    {msg.type === 'reaction' && (
                      <div className="px-4 py-2">
                        <p className="text-sm italic text-gray-600">{msg.content}</p>
                      </div>
                    )}
                    
                    {/* Quoted/Replied Message */}
                    {(msg.contextMessageContent || msg.contextMessageType) && (
                      <div className="px-4 pt-2">
                        <div className={`border-l-4 pl-3 py-2 rounded ${
                          msg.from === 'me' ? 'border-green-300 bg-green-50/50' : 'border-gray-300 bg-gray-50'
                        }`}>
                          <p className="text-xs font-medium opacity-70 mb-1">
                            {msg.from === 'me' ? 'You' : 'User'}
                          </p>
                          
                          {/* Show media preview for image/sticker */}
                          {msg.contextMessageType === 'image' && msg.contextMessageMediaUrl && (
                            <div className="flex items-center gap-2 mb-1">
                              <img 
                                src={msg.contextMessageMediaUrl} 
                                alt="Quoted" 
                                className="w-12 h-12 object-cover rounded"
                              />
                              <p className="text-sm opacity-75 line-clamp-2">
                                {msg.contextMessageContent || '[Image]'}
                              </p>
                            </div>
                          )}
                          
                          {/* Show sticker preview */}
                          {msg.contextMessageType === 'sticker' && msg.contextMessageMediaUrl && (
                            <img 
                              src={msg.contextMessageMediaUrl} 
                              alt="Sticker" 
                              className="w-16 h-16 object-contain"
                            />
                          )}
                          
                          {/* Show media type indicator for other media */}
                          {['video', 'audio', 'document'].includes(msg.contextMessageType) && (
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                {msg.contextMessageType === 'video' && (
                                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                )}
                                {msg.contextMessageType === 'audio' && (
                                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                  </svg>
                                )}
                                {msg.contextMessageType === 'document' && (
                                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </div>
                              <p className="text-sm opacity-75 line-clamp-2">
                                {msg.contextMessageContent || `[${msg.contextMessageType.toUpperCase()}]`}
                              </p>
                            </div>
                          )}
                          
                          {/* Show text content for text messages */}
                          {(!msg.contextMessageType || msg.contextMessageType === 'text') && msg.contextMessageContent && (
                            <p className="text-sm opacity-75 line-clamp-2">
                              {msg.contextMessageContent}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Text Content / Caption */}
                    {msg.content && !['image', 'video', 'audio', 'document', 'location', 'contacts', 'interactive', 'reaction', 'sticker'].includes(msg.type) && (
                      <div className="px-4 py-2">
                        <p>{msg.content}</p>
                      </div>
                    )}
                    
                    {/* Message Footer */}
                    <div className={`flex items-center justify-between px-4 pb-2 ${
                      msg.content ? '' : 'pt-2'
                    } ${
                      msg.from === 'me' ? 'text-green-900' : 'text-gray-600'
                    }`}>
                      <span className="text-xs font-semibold">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                      {msg.from === 'me' && (
                        <span className="flex items-center ml-2">
                          {msg.status === 'sent' && <Check className="w-3 h-3 text-green-900" />}
                          {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-green-900" />}
                          {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-600" />}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Reaction Menu - for received messages only */}
                  {msg.from !== 'me' && msg.messageId && msg.messageId.startsWith('wamid.') && (
                    <div className="px-4 pb-2">
                      {showReactionMenu === msg.messageId ? (
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 animate-fadeIn">
                          {['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleSendReaction(msg.messageId, emoji)}
                              className="text-2xl hover:scale-125 transition-transform"
                              title={`React with ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                          <button
                            onClick={() => setShowReactionMenu(null)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowReactionMenu(msg.messageId)}
                          className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                        >
                          <span>😊</span>
                          <span>React</span>
                        </button>
                      )}
                    </div>
                  )}
                    
                  {/* Reply Button - shows on hover, positioned to the right */}
                  {msg.from !== 'me' && msg.messageId && msg.messageId.startsWith('wamid.') && (
                    <button
                      onClick={() => setReplyingTo(msg)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-gray-200 hover:bg-gray-300 rounded-full flex-shrink-0 mt-2"
                      title="Reply to this message"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                  )}
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
              placeholder="Recipient number (e.g., +60123456789)"
              value={recipient}
              onChange={(e: any) => setRecipient(e.target.value)}
              className="message-input w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Message Mode Toggle */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => {
                setMessageMode('text');
                setSelectedTemplate(null);
                setTemplateVariables([]);
                handleClearFile();
              }}
              className={`message-type-button ${
                messageMode === 'text' ? 'active' : ''
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
              className={`message-type-button ${
                messageMode === 'media' ? 'active' : ''
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
              className={`message-type-button ${
                messageMode === 'buttons' ? 'active' : ''
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
              className={`message-type-button ${
                messageMode === 'list' ? 'active' : ''
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
              className={`message-type-button ${
                messageMode === 'cta' ? 'active' : ''
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
              className={`message-type-button ${
                messageMode === 'location' ? 'active' : ''
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs">Location</span>
            </button>
            <button
              onClick={() => {
                setMessageMode('contact');
                setSelectedTemplate(null);
                setTemplateVariables([]);
                handleClearFile();
              }}
              className={`message-type-button ${
                messageMode === 'contact' ? 'active' : ''
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs">Contact</span>
            </button>
            <button
              onClick={() => {
                setMessageMode('sticker');
                setSelectedTemplate(null);
                setTemplateVariables([]);
                handleClearFile();
              }}
              className={`message-type-button ${
                messageMode === 'sticker' ? 'active' : ''
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs">Sticker</span>
            </button>
            <button
              onClick={() => {
                setMessageMode('location_request');
                setSelectedTemplate(null);
                setTemplateVariables([]);
                handleClearFile();
              }}
              className={`message-type-button ${
                messageMode === 'location_request' ? 'active' : ''
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs">Request Loc</span>
            </button>
            <button
              onClick={() => {
                setMessageMode('address');
                setSelectedTemplate(null);
                setTemplateVariables([]);
                handleClearFile();
              }}
              className={`message-type-button ${
                messageMode === 'address' ? 'active' : ''
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs">Address</span>
            </button>
            <button
              onClick={() => {
                setMessageMode('media_carousel');
                setSelectedTemplate(null);
                setTemplateVariables([]);
                handleClearFile();
              }}
              className={`message-type-button ${
                messageMode === 'media_carousel' ? 'active' : ''
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs">Media Carousel</span>
            </button>
            <button
              onClick={() => {
                setMessageMode('product_carousel');
                setSelectedTemplate(null);
                setTemplateVariables([]);
                handleClearFile();
              }}
              className={`message-type-button ${
                messageMode === 'product_carousel' ? 'active' : ''
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs">Product Carousel</span>
            </button>
            <button
              onClick={() => setMessageMode('template')}
              className={`message-type-button ${
                messageMode === 'template' ? 'active' : ''
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-xs">Template</span>
            </button>
          </div>

          {/* Text Message Mode */}
          {messageMode === 'text' && (
            <div className="space-y-3">
              {/* Replying To Preview */}
              {replyingTo && (
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        ↩️ Replying to:
                      </p>
                      
                      {/* Show media preview based on message type */}
                      <div className="flex items-start gap-2">
                        {/* Image preview */}
                        {replyingTo.type === 'image' && replyingTo.mediaUrl && (
                          <img 
                            src={replyingTo.mediaUrl} 
                            alt="Preview" 
                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                          />
                        )}
                        
                        {/* Sticker preview */}
                        {replyingTo.type === 'sticker' && replyingTo.mediaUrl && (
                          <img 
                            src={replyingTo.mediaUrl} 
                            alt="Sticker" 
                            className="w-12 h-12 object-contain flex-shrink-0"
                          />
                        )}
                        
                        {/* Video/Audio/Document icon */}
                        {['video', 'audio', 'document'].includes(replyingTo.type) && (
                          <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                            {replyingTo.type === 'video' && (
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                            {replyingTo.type === 'audio' && (
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                              </svg>
                            )}
                            {replyingTo.type === 'document' && (
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                        )}
                        
                        {/* Location icon */}
                        {replyingTo.type === 'location' && (
                          <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Contact icon */}
                        {replyingTo.type === 'contacts' && (
                          <div className="w-12 h-12 bg-cyan-100 rounded flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-blue-700 line-clamp-2">
                            {replyingTo.content || `[${replyingTo.type?.toUpperCase() || 'MEDIA'}]`}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
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
              <div className="flex gap-2 relative">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e: any) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e: any) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                    title="Add emoji"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 right-0 bg-white border rounded-lg shadow-lg p-3 w-80 max-h-64 overflow-y-auto z-50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Select Emoji</p>
                        <button
                          onClick={() => setShowEmojiPicker(false)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-8 gap-1">
                        {[
                          '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
                          '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
                          '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
                          '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
                          '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
                          '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
                          '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '🥴', '😵',
                          '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟',
                          '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦',
                          '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
                          '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡',
                          '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡',
                          '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏',
                          '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆',
                          '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛',
                          '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️',
                          '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
                          '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅',
                          '👄', '💋', '🩸', '❤️', '🧡', '💛', '💚', '💙',
                          '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕',
                          '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
                          '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️',
                          '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌',
                          '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔',
                          '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚',
                          '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️',
                          '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎',
                          '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛',
                          '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱',
                          '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️',
                          '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️',
                          '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎',
                          '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿',
                          '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹',
                          '🚺', '🚼', '⚧️', '🚻', '🚮', '🎦', '📶', '🈁',
                          '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙',
                          '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣',
                          '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣',
                          '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️',
                          '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽',
                          '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️',
                          '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁',
                          '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗',
                          '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️',
                          '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️',
                          '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣',
                          '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶',
                          '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️',
                          '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛',
                          '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕',
                          '📣', '📢', '👁️‍🗨️', '💬', '💭', '🗯️', '♠️', '♣️',
                          '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒',
                          '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚',
                          '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢',
                          '🕣', '🕤', '🕥', '🕦', '🕧', '👍', '👎', '✌️',
                          '🤝', '🙏', '💪', '🎉', '🎊', '🎈', '🎁', '🏆',
                          '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🥎',
                          '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸',
                          '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁',
                          '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼',
                          '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️',
                          '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘',
                          '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆'
                        ].map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setNewMessage(newMessage + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-2xl hover:bg-gray-100 rounded p-1 transition-colors"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSendMessage}
                  className="send-button flex items-center gap-2"
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
                  <button
                    onClick={() => {
                      setMessageMode('media');
                      setMediaType('voice');
                      setSelectedTemplate(null);
                      setTemplateVariables([]);
                    }}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      messageMode === 'media' && mediaType === 'voice' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    title="Voice message with transcription"
                  >
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <p className="text-xs">Voice</p>
                    <p className="text-[10px] text-gray-400">w/ transcript</p>
                  </button>
                </div>
              )}

              {/* File Upload Area or Voice Recording */}
              {!selectedFile ? (
                mediaType === 'voice' ? (
                  <VoiceRecorder
                    onRecordingComplete={(file) => {
                      setSelectedFile(file);
                      setFilePreview(URL.createObjectURL(file));
                    }}
                    onCancel={() => setMediaType('audio')}
                  />
                ) : (
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
                )
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
                        <p className="text-gray-600 font-medium">{selectedFile?.name}</p>
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
                    <span>{selectedFile?.name}</span>
                    <span>{selectedFile ? (selectedFile.size / 1024).toFixed(1) : '0'} KB</span>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={uploading}
                    className="send-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                className="send-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                className="send-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                className="send-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                className="send-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Location
              </button>
            </div>
          )}

          {/* Contact Mode */}
          {messageMode === 'contact' && (
            <div className="space-y-3">
              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* First and Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    value={contactFirstName}
                    onChange={(e) => setContactFirstName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={contactLastName}
                    onChange={(e) => setContactLastName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+60123456789"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optional)
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Company and Title */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Inc"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="CEO"
                    value={contactTitle}
                    onChange={(e) => setContactTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Preview */}
              {contactName && contactPhone && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <div className="bg-white rounded-lg shadow p-4 max-w-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-cyan-100 rounded-full">
                        <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{contactName}</p>
                        {contactCompany && (
                          <p className="text-sm text-gray-600">{contactTitle ? `${contactTitle} at ${contactCompany}` : contactCompany}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-2">{contactPhone}</p>
                        {contactEmail && (
                          <p className="text-sm text-gray-600">{contactEmail}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!contactName || !contactPhone}
                className="send-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Contact
              </button>
            </div>
          )}

          {/* Sticker Mode */}
          {messageMode === 'sticker' && (
            <div className="space-y-3">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Note:</strong> Stickers must be in WebP format with transparent background.
                </p>
                <p className="text-xs text-yellow-700">
                  Recommended size: 512x512 pixels, max 100KB
                </p>
              </div>

              {/* Sticker URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sticker URL *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/sticker.webp"
                  value={stickerUrl}
                  onChange={(e) => setStickerUrl(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a direct URL to a WebP sticker image
                </p>
              </div>

              {/* Preview */}
              {stickerUrl && stickerUrl.match(/^https?:\/\/.+/) && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <div className="bg-white rounded-lg shadow p-4 max-w-sm">
                    <div className="flex items-center justify-center">
                      <img 
                        src={stickerUrl} 
                        alt="Sticker preview" 
                        className="w-32 h-32 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Example Stickers */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium text-gray-700 mb-2">Example Stickers:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setStickerUrl('https://raw.githubusercontent.com/WhatsApp/stickers/main/Android/app/src/main/assets/1/01_Cuppy_smile.webp')}
                    className="p-2 bg-white rounded-lg border hover:border-yellow-500 transition-colors"
                  >
                    <img 
                      src="https://raw.githubusercontent.com/WhatsApp/stickers/main/Android/app/src/main/assets/1/01_Cuppy_smile.webp" 
                      alt="Example 1" 
                      className="w-full h-20 object-contain"
                    />
                  </button>
                  <button
                    onClick={() => setStickerUrl('https://raw.githubusercontent.com/WhatsApp/stickers/main/Android/app/src/main/assets/1/02_Cuppy_lol.webp')}
                    className="p-2 bg-white rounded-lg border hover:border-yellow-500 transition-colors"
                  >
                    <img 
                      src="https://raw.githubusercontent.com/WhatsApp/stickers/main/Android/app/src/main/assets/1/02_Cuppy_lol.webp" 
                      alt="Example 2" 
                      className="w-full h-20 object-contain"
                    />
                  </button>
                  <button
                    onClick={() => setStickerUrl('https://raw.githubusercontent.com/WhatsApp/stickers/main/Android/app/src/main/assets/1/03_Cuppy_rofl.webp')}
                    className="p-2 bg-white rounded-lg border hover:border-yellow-500 transition-colors"
                  >
                    <img 
                      src="https://raw.githubusercontent.com/WhatsApp/stickers/main/Android/app/src/main/assets/1/03_Cuppy_rofl.webp" 
                      alt="Example 3" 
                      className="w-full h-20 object-contain"
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click an example to use it
                </p>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!stickerUrl || !stickerUrl.match(/^https?:\/\/.+/)}
                className="send-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Sticker
              </button>
            </div>
          )}

          {/* Location Request Mode */}
          {messageMode === 'location_request' && (
            <div className="space-y-3">
              <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                <p className="text-sm text-pink-800 mb-2">
                  <strong>📍 Request Location</strong>
                </p>
                <p className="text-xs text-pink-700">
                  Ask the user to share their current location. They will see a button to share their location in WhatsApp.
                </p>
              </div>

              {/* Request Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Message *
                </label>
                <textarea
                  placeholder="Please share your location so we can assist you better."
                  value={locationRequestText}
                  onChange={(e) => setLocationRequestText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be shown with a "Share Location" button
                </p>
              </div>

              {/* Example Messages */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium text-gray-700 mb-2">Example Messages:</p>
                <div className="space-y-2">
                  <button
                    onClick={() => setLocationRequestText('Please share your location so we can assist you better.')}
                    className="w-full text-left p-2 bg-white rounded border hover:border-pink-500 transition-colors text-sm"
                  >
                    "Please share your location so we can assist you better."
                  </button>
                  <button
                    onClick={() => setLocationRequestText('Where are you located? Share your location to help us serve you.')}
                    className="w-full text-left p-2 bg-white rounded border hover:border-pink-500 transition-colors text-sm"
                  >
                    "Where are you located? Share your location to help us serve you."
                  </button>
                  <button
                    onClick={() => setLocationRequestText('For delivery, please share your current location.')}
                    className="w-full text-left p-2 bg-white rounded border hover:border-pink-500 transition-colors text-sm"
                  >
                    "For delivery, please share your current location."
                  </button>
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!locationRequestText.trim()}
                className="send-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Request Location
              </button>
            </div>
          )}

          {/* Address Mode */}
          {messageMode === 'address' && (
            <div className="space-y-3">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-800 mb-2">
                  <strong>🏠 Send Address</strong>
                </p>
                <p className="text-xs text-orange-700">
                  Send a formatted address as a contact card. The recipient can tap to open it in Maps.
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name / Place *
                </label>
                <input
                  type="text"
                  placeholder="John Doe / ACME Corporation"
                  value={addressName}
                  onChange={(e) => setAddressName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  placeholder="123 Main Street"
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="Kuala Lumpur"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Wilayah Persekutuan"
                    value={addressState}
                    onChange={(e) => setAddressState(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Zip & Country */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    placeholder="50000"
                    value={addressZip}
                    onChange={(e) => setAddressZip(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    placeholder="Malaysia"
                    value={addressCountry}
                    onChange={(e) => setAddressCountry(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Address Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Type
                </label>
                <select
                  value={addressType}
                  onChange={(e) => setAddressType(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="HOME">Home</option>
                  <option value="WORK">Work</option>
                </select>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={!addressName.trim() || !addressStreet.trim() || !addressCity.trim() || !addressCountry.trim()}
                className="send-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Address
              </button>
            </div>
          )}

          {/* Media Carousel Mode */}
          {messageMode === 'media_carousel' && (
            <div className="space-y-3">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800 mb-2">
                  <strong>📸 Media Carousel</strong>
                </p>
                <p className="text-xs text-purple-700">
                  Send 2-10 horizontally scrollable cards with images/videos and CTA buttons. All cards must use the same media type.
                </p>
              </div>

              {/* Body Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Text * (max 1024 chars)
                </label>
                <textarea
                  placeholder="Check out our latest offers!"
                  value={carouselBodyText}
                  onChange={(e) => setCarouselBodyText(e.target.value)}
                  maxLength={1024}
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">{carouselBodyText.length}/1024 characters</p>
              </div>

              {/* Cards */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cards ({carouselCards.length}/10)
                  </label>
                  {carouselCards.length < 10 && (
                    <button
                      onClick={handleAddCarouselCard}
                      className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Card
                    </button>
                  )}
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {carouselCards.map((card, index) => (
                    <div key={index} className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-purple-900">Card {index + 1}</h4>
                        {carouselCards.length > 2 && (
                          <button
                            onClick={() => handleRemoveCarouselCard(index)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {/* Header Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Media Type * {index === 0 && '(all cards must match)'}
                          </label>
                          <select
                            value={card.headerType}
                            onChange={(e) => handleCarouselCardChange(index, 'headerType', e.target.value)}
                            disabled={index > 0}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm disabled:bg-gray-100"
                          >
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                          </select>
                        </div>

                        {/* Media Link */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {card.headerType === 'image' ? 'Image' : 'Video'} URL *
                          </label>
                          <input
                            type="url"
                            placeholder={`https://example.com/${card.headerType === 'image' ? 'image.jpg' : 'video.mp4'}`}
                            value={card.mediaLink}
                            onChange={(e) => handleCarouselCardChange(index, 'mediaLink', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                        </div>

                        {/* Body Text */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Text (optional, max 160 chars)
                          </label>
                          <input
                            type="text"
                            placeholder="Exclusive deal #1"
                            value={card.bodyText}
                            onChange={(e) => handleCarouselCardChange(index, 'bodyText', e.target.value)}
                            maxLength={160}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1">{card.bodyText.length}/160</p>
                        </div>

                        {/* Button Text */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Button Text * (max 20 chars)
                          </label>
                          <input
                            type="text"
                            placeholder="Shop now"
                            value={card.buttonText}
                            onChange={(e) => handleCarouselCardChange(index, 'buttonText', e.target.value)}
                            maxLength={20}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1">{card.buttonText.length}/20</p>
                        </div>

                        {/* Button URL */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Button URL *
                          </label>
                          <input
                            type="url"
                            placeholder="https://shop.example.com/deal1"
                            value={card.buttonUrl}
                            onChange={(e) => handleCarouselCardChange(index, 'buttonUrl', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={
                  !carouselBodyText.trim() ||
                  carouselCards.some(card => !card.mediaLink || !card.buttonText || !card.buttonUrl)
                }
                className="send-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Media Carousel
              </button>
            </div>
          )}

          {/* Product Carousel Mode */}
          {messageMode === 'product_carousel' && (
            <div className="space-y-3">
              <div className="p-4 bg-fuchsia-50 rounded-lg border border-fuchsia-200">
                <p className="text-sm text-fuchsia-800 mb-2">
                  <strong>🛍️ Product Carousel</strong>
                </p>
                <p className="text-xs text-fuchsia-700">
                  Send 2-10 horizontally scrollable product cards from your catalog. Requires WhatsApp Business Catalog setup.
                </p>
              </div>

              {/* Body Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Text * (max 1024 chars)
                </label>
                <textarea
                  placeholder="Check out our featured products!"
                  value={productCarouselBodyText}
                  onChange={(e) => setProductCarouselBodyText(e.target.value)}
                  maxLength={1024}
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
                <p className="text-xs text-gray-500 mt-1">{productCarouselBodyText.length}/1024 characters</p>
              </div>

              {/* Catalog ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catalog ID *
                </label>
                <input
                  type="text"
                  placeholder="Your WhatsApp Business Catalog ID"
                  value={catalogId}
                  onChange={(e) => setCatalogId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find this in your WhatsApp Business Manager under Commerce → Catalogs
                </p>
              </div>

              {/* Product Cards */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Products ({productCards.length}/10)
                  </label>
                  {productCards.length < 10 && (
                    <button
                      onClick={handleAddProductCard}
                      className="text-sm text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {productCards.map((card, index) => (
                    <div key={index} className="p-3 border-2 border-fuchsia-200 rounded-lg bg-fuchsia-50">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Product {index + 1} - Retailer ID *
                          </label>
                          <input
                            type="text"
                            placeholder="Product SKU or Retailer ID"
                            value={card.productRetailerId}
                            onChange={(e) => handleProductCardChange(index, e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            The unique product ID from your catalog
                          </p>
                        </div>
                        {productCards.length > 2 && (
                          <button
                            onClick={() => handleRemoveProductCard(index)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Helper Info */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 font-medium mb-1">💡 How to find Product IDs:</p>
                <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                  <li>Go to WhatsApp Business Manager → Commerce → Catalogs</li>
                  <li>Select your catalog and view products</li>
                  <li>Each product has a "Retailer ID" (also called SKU or Product ID)</li>
                  <li>Copy the exact ID and paste it here</li>
                </ul>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={
                  !productCarouselBodyText.trim() ||
                  !catalogId.trim() ||
                  productCards.some(card => !card.productRetailerId.trim())
                }
                className="send-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Product Carousel
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
                className="send-button w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
