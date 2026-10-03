export interface Chat {
  id: number;
  name: string;
  avatar: string;
  message: string;
  time: string;
  unread?: number;
  updatedAt: Date | string;
}

export interface Message {
  id?: string | number;
  sender: 'user' | 'shop';
  text: string;
  time: string;
  timestamp?: Date | string;
}
