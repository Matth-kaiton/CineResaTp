import { describe, it, beforeEach, expect, vi } from "vitest";
import { BookingService } from "../src/application/usecases/BookingService";
import { UserStatus } from "../src/domain/enum/UserStatuts";
import { BookingStatus } from "../src/domain/enum/BookingStatus";
import { ScreeningService } from "../src/application/usecases/ScreeningService";
import { ScreeningRepositoryPort } from "../src/application/ports/out/ScreeningRepositoryPort";
import { BookingRepositoryPort } from "../src/application/ports/out/BookingRepositoryPort";
import { NotifyPort } from "../src/application/ports/out/NotifyPort";
import { PaymentPort } from "../src/application/ports/out/PaymentPort";
import ErrorResponse from "../src/domain/errorResponse";

// Squelette fourni : transformez chaque it.todo en vrai test.
// Utilisez uniquement des adapters de test : InMemory…Repository, FakePaymentGateway(() => true/false),
// une horloge figée { now: () => NOW }, un générateur d'id { next: () => "b1" } et un notifier « espion ».
describe("BookSeatsService", () => {
  let bookingService: BookingService;

  let fakeScreeningService: ScreeningService;
  let fakeScreeningRepo: ScreeningRepositoryPort;
  let fakeBookingRepo: BookingRepositoryPort;
  let fakeMailer: NotifyPort;
  let fakePayment: PaymentPort;

  beforeEach(() => {
    fakeScreeningService = {
      getScreeningById: async (id: string) => ({
        id: "s1",
        movie: "Inception",
        price: 1000,
        startsAt: new Date(Date.now() + 3600000),
        capacity: 50,
        room: "Salle 1",
      }),
    } as unknown as ScreeningService;

    fakeScreeningRepo = {
      countRemainingSeats: async () => 20,
    } as unknown as ScreeningRepositoryPort;

    fakeBookingRepo = {
      create: async (booking: any) => booking,
    } as unknown as BookingRepositoryPort;

    fakeMailer = {
      sendNotification: vi.fn().mockResolvedValue(undefined),
    };

    fakePayment = {
      pay: async () => true,
    };

    bookingService = new BookingService(
      fakeScreeningService,
      fakeScreeningRepo,
      fakeBookingRepo,
      fakeMailer,
      fakePayment,
    );
  });

  it("réserve des places, calcule le prix (4 places étudiant = 2 520 centimes pour 10 €) et notifie le client", async () => {
    const booking = await bookingService.makeBooking(
      "s1",
      "matthias@ynov.com",
      4,
      UserStatus.STUDENT,
    );
    expect(booking).toBeDefined();
    expect(booking.seats).toBe(4);
    expect(booking.total).toBe(2520);
    expect(booking.status).toBe(BookingStatus.CONFIRMED);
    expect(fakeMailer.sendNotification).toHaveBeenCalledTimes(1);
  });
  it("refuse si la capacité de la salle est dépassée", async () => {
    fakeScreeningRepo.countRemainingSeats = async () => 2;

    try {
      await bookingService.makeBooking("s1", "matthias@ynov.com", 4);
      expect.fail("Devrait lever une erreur");
    } catch (err: any) {
      expect(err.statusCode).toBe(409);
    }
  });
  it("refuse une séance déjà commencée (code CONFLICT)", async () => {
    fakeScreeningService.getScreeningById = async () => ({
      id: "s1",
      movie: "Inception",
      price: 1000,
      startsAt: new Date(Date.now() - 3600000),
      room: "Salle 1",
      capacity: 50,
    });

    try {
      await bookingService.makeBooking("s1", "matthias@ynov.com", 2);
      expect.fail("Devrait lever une erreur");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ErrorResponse);
      expect(err.statusCode).toBe(409);
    }
  });
  it("refuse plus de 6 places (code INVALID)", async () => {
    try {
      await bookingService.makeBooking("s1", "matthias@ynov.com", 7);
      expect.fail("Devrait lever une erreur");
    } catch (err: any) {
      expect(err.statusCode).toBe(400);
    }
  });
  it("refuse un email invalide (code INVALID)", async () => {
    try {
      await bookingService.makeBooking("s1", "mauvais-email", 2);
      expect.fail("Devrait lever une erreur");
    } catch (err: any) {
      expect(err.statusCode).toBe(400);
    }
  });
  it("refuse une séance inconnue (code NOT_FOUND)", async () => {
    fakeScreeningService.getScreeningById = async (id: string) => {
      if (id === "s99") return null;
      return {
        id: "s1",
        movie: "Inception",
        price: 1000,
        startsAt: new Date(Date.now() + 3600000),
        capacity: 50,
        room: "Salle 1",
      };
    };

    try {
      await bookingService.makeBooking(
        "s99", // 👈 On demande "s99" qui n'existe pas
        "matthias@ynov.com",
        2,
        UserStatus.NORMAL,
      );
      expect.fail("Devrait lever une erreur");
    } catch (err: any) {
      expect(err.statusCode).toBe(404);
    }
  });
  it("n'enregistre rien et ne notifie pas si le paiement est refusé (code PAYMENT_REFUSED)", async () => {
    fakePayment.pay = async () => false;

    const createSpy = vi.spyOn(fakeBookingRepo, "create");

    try {
      await bookingService.makeBooking("s1", "matthias@ynov.com", 2);
      expect.fail("Devrait lever une erreur");
    } catch (err: any) {
      expect(err.statusCode).toBe(402);
    }

    expect(createSpy).not.toHaveBeenCalled();
    expect(fakeMailer.sendNotification).not.toHaveBeenCalled();
  });
});
