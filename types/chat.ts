export interface ChatMessage {
  _id: string | number;
  text: string;
  createdAt: Date;
  user: ChatUser;
}

export interface ChatUser {
  _id: string | number;
  name: string;
  avatar?: string;
}

export interface ChatData {
  [key: string]: {
    title: string;
    messages: ChatMessage[];
  };
}
