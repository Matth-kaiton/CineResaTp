import { NotifyPort } from "../../../application/ports/out/NotifyPort";
import { Booking } from "../../../domain/booking/Booking";

class Mailer implements NotifyPort {
  async sendNotification(to: string, message: string) {
    console.log(`[SMTP] To: ${to} — ${message}`);
  }

  async bookingConfirmed(booking: Booking) {
    await this.sendNotification(
      booking.email,
      `Your booking for screening ${booking.screeningId} is confirmed. Total: ${booking.total}`,
    );
  }

  async bookingCancelled(booking: Booking) {
    await this.sendNotification(
      booking.email,
      `Your booking ${booking.id} has been cancelled.`,
    );
  }
}

export default new Mailer();
