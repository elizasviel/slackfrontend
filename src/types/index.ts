export interface User {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  status: UserStatus;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  iconUrl?: string;
  ownerId: string;
  members: WorkspaceMember[];
  channels: Channel[];
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  workspaceId: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  createdAt: string;
}

export interface Reaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    fullName: string | null;
  };
}

export interface Message {
  id: string;
  content: string;
  channelId: string;
  userId: string;
  threadParentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  edited: boolean;
  user: {
    id: string;
    username: string;
    fullName: string | null;
    avatarUrl?: string;
  };
  reactions?: Reaction[];
  files?: FileAttachment[];
}

export enum UserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  AWAY = "AWAY",
  DO_NOT_DISTURB = "DO_NOT_DISTURB",
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: User;
}

export interface DirectMessage {
  id: string;
  content: string;
  fromId: string;
  toId: string;
  createdAt: Date;
  updatedAt: Date;
  from: User;
  to: User;
  files?: FileAttachment[];
}
