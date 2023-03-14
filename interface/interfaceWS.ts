export interface ISMessageSend {
  type: string;
  to: string;
  from: string;
  id: any;
  message: string;
  isMedia: boolean;
  typeMedia: string;
  media: string;
  date: string;
}
