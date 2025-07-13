export interface ChatListItem {
  id: string;
  title: string;
  description: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  unreadCount: number;
}

export interface ChatMessage {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: number;
    name: string;
    avatar: string;
  };
}

export const chatListData: ChatListItem[] = [
  {
    id: '1',
    title: 'Sarah Wilson',
    description: 'Hey! How are you doing today?',
    lastMessage: 'Great! Let\'s meet up soon',
    timestamp: '2 min ago',
    avatar: 'https://i.pravatar.cc/150?img=1',
    unreadCount: 2,
  },
  {
    id: '2',
    title: 'Project Team',
    description: 'Meeting scheduled for tomorrow',
    lastMessage: 'Perfect, see you all then',
    timestamp: '1 hour ago',
    avatar: 'https://i.pravatar.cc/150?img=2',
    unreadCount: 0,
  },
  {
    id: '3',
    title: 'Alex Chen',
    description: 'Thanks for the help with the code!',
    lastMessage: 'No problem, anytime!',
    timestamp: '3 hours ago',
    avatar: 'https://i.pravatar.cc/150?img=3',
    unreadCount: 1,
  },
  {
    id: '4',
    title: 'Family Group',
    description: 'Don\'t forget about dinner on Sunday',
    lastMessage: 'I\'ll be there!',
    timestamp: '1 day ago',
    avatar: 'https://i.pravatar.cc/150?img=4',
    unreadCount: 0,
  },
  {
    id: '5',
    title: 'Emma Davis',
    description: 'The presentation went really well!',
    lastMessage: 'Congratulations! 🎉',
    timestamp: '2 days ago',
    avatar: 'https://i.pravatar.cc/150?img=5',
    unreadCount: 0,
  },
];

export const getChatMessages = (chatId: string): ChatMessage[] => {
  const baseMessages: ChatMessage[] = [
    {
      _id: '1',
      text: 'Hello! How are you doing today?',
      createdAt: new Date(Date.now() - 60000 * 30),
      user: {
        _id: 2,
        name: 'Other User',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
    },
    {
      _id: '2',
      text: 'I\'m doing great! Thanks for asking. How about you?',
      createdAt: new Date(Date.now() - 60000 * 25),
      user: {
        _id: 1,
        name: 'You',
        avatar: 'https://i.pravatar.cc/150?img=10',
      },
    },
    {
      _id: '3',
      text: 'Pretty good! Just working on some exciting projects.',
      createdAt: new Date(Date.now() - 60000 * 20),
      user: {
        _id: 2,
        name: 'Other User',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
    },
    {
      _id: '4',
      text: 'That sounds awesome! What kind of projects?',
      createdAt: new Date(Date.now() - 60000 * 15),
      user: {
        _id: 1,
        name: 'You',
        avatar: 'https://i.pravatar.cc/150?img=10',
      },
    },
    {
      _id: '5',
      text: 'I\'m building a React Native chat app with some really cool features!',
      createdAt: new Date(Date.now() - 60000 * 10),
      user: {
        _id: 2,
        name: 'Other User',
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
    },
    {
      _id: '6',
      text: 'Wow, that\'s really interesting! I\'d love to hear more about it.',
      createdAt: new Date(Date.now() - 60000 * 5),
      user: {
        _id: 1,
        name: 'You',
        avatar: 'https://i.pravatar.cc/150?img=10',
      },
    },
  ];

  // Customize messages based on chat ID for variety
  const chatSpecificMessages = baseMessages.map((msg, index) => ({
    ...msg,
    _id: `${chatId}-${msg._id}`,
    text: getChatSpecificMessage(chatId, index, msg.text),
    user: {
      ...msg.user,
      name: msg.user._id === 2 ? getChatTitle(chatId) : 'You',
      avatar: msg.user._id === 2 ? `https://i.pravatar.cc/150?img=${parseInt(chatId)}` : 'https://i.pravatar.cc/150?img=10',
    },
  }));

  return chatSpecificMessages;
};

const getChatTitle = (chatId: string): string => {
  const chat = chatListData.find(c => c.id === chatId);
  return chat?.title || 'Unknown User';
};

const getChatSpecificMessage = (chatId: string, index: number, defaultText: string): string => {
  const chatSpecificTexts: { [key: string]: string[] } = {
    '1': [
      'Hey! How are you doing today?',
      'I\'m doing amazing! Just got back from a great workout.',
      'That\'s wonderful! I love staying active too.',
      'Do you have any favorite exercises?',
      'I really enjoy yoga and running. How about you?',
      'Those sound great! I should try yoga sometime.',
    ],
    '2': [
      'Hi everyone! Ready for tomorrow\'s meeting?',
      'Yes, I have all my materials prepared.',
      'Great! I\'ve prepared the presentation slides.',
      'Perfect! What time should we start?',
      'How about 10 AM? That works for everyone, right?',
      'Sounds good to me! See you all then.',
    ],
    '3': [
      'Thanks for helping me with the coding issue!',
      'No problem at all! Happy to help.',
      'Your solution was brilliant and elegant.',
      'I learned a lot from your approach.',
      'That\'s the beauty of collaborative coding!',
      'Absolutely! Feel free to reach out anytime.',
    ],
  };

  const messages = chatSpecificTexts[chatId];
  if (messages && messages[index]) {
    return messages[index];
  }
  return defaultText;
};
