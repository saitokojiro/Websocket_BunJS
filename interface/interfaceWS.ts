
export interface ISAccountSend {
  id: string,
  user: string,
  email: string,
  password: string
  create_At: Date,
  status: "Online" | "Idle" | "Do Not Disturb" | "Invisible" | "Offline"
  enable: boolean,
}

export interface ISStatusAccount {
  status: "Online" | "Idle" | "Do Not Disturb" | "Invisible" | "Offline",
}


export interface ISMessageSend {
  id: any;
  type: string;
  to: string;
  sender: string;
  message: string;
  isMedia: boolean;
  typeMedia: string;
  media: string;
  date: string;
  read: boolean;
}

export interface ISPrivateMessageTyping {
  id: any;
  type: string;
  to: string;
  sender: string;
}