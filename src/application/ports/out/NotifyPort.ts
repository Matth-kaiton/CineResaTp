export interface NotifyPort {
  sendNotification(to: string, message: string): Promise<void>;
}
