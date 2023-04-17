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
