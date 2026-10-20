import { NotifyPort } from "../../../application/ports/out/NotifyPort";

export default class Mailer implements NotifyPort {
  async sendNotification(to: string, message: string) {
    console.log(`[SMTP] To: ${to} — ${message}`);
  }
}
