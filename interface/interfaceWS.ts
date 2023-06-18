export interface ISAccountSend{
  id: string, 
  user: string,
  create_At: Date,
  enable: boolean,
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
}

/*
id: escapeHTML(accountJson.id), 
            user: escapeHTML(accountJson.user),
            create_At: escapeHTML(accountJson.create_At),
            enable: escapeHTML(accountJson.enable),*/