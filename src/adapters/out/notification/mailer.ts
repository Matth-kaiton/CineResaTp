import { NotifyPort } from "../../../application/ports/out/NotifyPort";

class Mailer implements NotifyPort {
  async sendNotification(to: string, message: string) {
    console.log(`[SMTP] To: ${to} — ${message}`);
  }
}

export default new Mailer();
