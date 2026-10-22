import { describe, it, beforeEach, expect, vi } from "vitest";
import { BookingService } from "../src/application/usecases/BookingService";
import { UserStatus } from "../src/domain/enum/UserStatuts";
import { BookingStatus } from "../src/domain/enum/BookingStatus";
import { ScreeningService } from "../src/application/usecases/ScreeningService";
import { ScreeningRepository } from "../src/application/ports/out/ScreeningRepository";
import { BookingRepository } from "../src/application/ports/out/BookingRepository";
import { NotifyPort } from "../src/application/ports/out/NotifyPort";
import { PaymentPort } from "../src/application/ports/out/PaymentPort";
import ErrorResponse from "../src/domain/errorResponse";

// Squelette fourni : transformez chaque it.todo en vrai test.
// Utilisez uniquement des adapters de test : InMemory…Repository, FakePaymentGateway(() => true/false),
// une horloge figée { now: () => NOW }, un générateur d'id { next: () => "b1" } et un notifier « espion ».
describe("BookSeatsService", () => {
  let bookingService: BookingService;

  let fakeScreeningService: ScreeningService;
  let fakeScreeningRepo: ScreeningRepository;
  let fakeBookingRepo: BookingRepository;
  let fakeMailer: NotifyPort;
  let fakePayment: PaymentPort;
  let fakeClock: { now: () => Date };

  beforeEach(() => {
    fakeClock = { now: () => new Date("2026-10-22T10:00:00.000Z") };
    const now = fakeClock.now();

    fakeScreeningService = {
      getScreeningById: async (id: string) => ({
        id: "s1",
        movie: "Inception",
        price: 1000,
        startsAt: new Date(now.getTime() + 4 * 3600000),
        capacity: 50,
        room: "Salle 1",
      }),
    } as unknown as ScreeningService;

    fakeScreeningRepo = {
      countRemainingSeats: async () => 20,
    } as unknown as ScreeningRepository;

    fakeBookingRepo = {
      save: async (booking: any) => booking,
    } as unknown as BookingRepository;

    fakeMailer = {
      sendNotification: vi.fn().mockResolvedValue(undefined),
      bookingConfirmed: vi.fn().mockResolvedValue(undefined),
      bookingCancelled: vi.fn().mockResolvedValue(undefined),
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
      fakeClock,
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
    expect(fakeMailer.bookingConfirmed).toHaveBeenCalledTimes(1);
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
      startsAt: new Date(fakeClock.now().getTime() - 3600000),
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
        "s99",
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

    const saveSpy = vi.spyOn(fakeBookingRepo, "save");

    try {
      await bookingService.makeBooking("s1", "matthias@ynov.com", 2);
      expect.fail("Devrait lever une erreur");
    } catch (err: any) {
      expect(err.statusCode).toBe(402);
    }

    expect(saveSpy).not.toHaveBeenCalled();
    expect(fakeMailer.bookingConfirmed).not.toHaveBeenCalled();
  });
  it("annule avec succès une réservation plus de 2h avant la séance avec une horloge figée", async () => {
    const now = fakeClock.now();
    fakeScreeningService.getScreeningById = async () => ({
      id: "s1",
      movie: "Inception",
      price: 1000,
      startsAt: new Date(now.getTime() + 4 * 3600000), // séance dans 4h
      capacity: 50,
      room: "Salle 1",
    });

    const existingBooking = {
      id: "b1",
      screeningId: "s1",
      email: "matthias@ynov.com",
      seats: 2,
      total: 2000,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date(now.getTime() - 2 * 3600000), // créée il y a 2h
    };

    fakeBookingRepo.findById = async () => ({ ...existingBooking } as any);
    const saveSpy = vi.spyOn(fakeBookingRepo, "save");

    const cancelled = await bookingService.cancelBooking("b1");
    expect(cancelled.status).toBe(BookingStatus.CANCELLED);
    expect(cancelled.cancelledAt).toEqual(now);
    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(fakeMailer.bookingCancelled).toHaveBeenCalledTimes(1);
  });

  it("refuse d'annuler moins de 2h avant la séance (ex: 1h59) avec une horloge figée (code CONFLICT)", async () => {
    const now = fakeClock.now();
    // Séance dans 1h59 (119 minutes, donc < 2h)
    fakeScreeningService.getScreeningById = async () => ({
      id: "s1",
      movie: "Inception",
      price: 1000,
      startsAt: new Date(now.getTime() + 119 * 60 * 1000),
      capacity: 50,
      room: "Salle 1",
    });

    const existingBooking = {
      id: "b1",
      screeningId: "s1",
      email: "matthias@ynov.com",
      seats: 2,
      total: 2000,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date(now.getTime() - 2 * 3600000),
    };

    fakeBookingRepo.findById = async () => ({ ...existingBooking } as any);

    try {
      await bookingService.cancelBooking("b1");
      expect.fail("Devrait lever une erreur");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ErrorResponse);
      expect(err.statusCode).toBe(409);
    }
  });

  it("autorise l'annulation à la limite exacte des 2h avec une horloge figée", async () => {
    const now = fakeClock.now();
    // Séance dans 2h pile (120 minutes)
    fakeScreeningService.getScreeningById = async () => ({
      id: "s1",
      movie: "Inception",
      price: 1000,
      startsAt: new Date(now.getTime() + 120 * 60 * 1000),
      capacity: 50,
      room: "Salle 1",
    });

    const existingBooking = {
      id: "b1",
      screeningId: "s1",
      email: "matthias@ynov.com",
      seats: 2,
      total: 2000,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date(now.getTime() - 2 * 3600000),
    };

    fakeBookingRepo.findById = async () => ({ ...existingBooking } as any);

    const cancelled = await bookingService.cancelBooking("b1");
    expect(cancelled.status).toBe(BookingStatus.CANCELLED);
    expect(cancelled.cancelledAt).toEqual(now);
  });

  it("refuse d'annuler une réservation déjà annulée (code CONFLICT)", async () => {
    const existingBooking = {
      id: "b1",
      screeningId: "s1",
      email: "matthias@ynov.com",
      seats: 2,
      total: 2000,
      status: BookingStatus.CANCELLED,
    };

    fakeBookingRepo.findById = async () => existingBooking as any;

    try {
      await bookingService.cancelBooking("b1");
      expect.fail("Devrait lever une erreur");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ErrorResponse);
      expect(err.statusCode).toBe(409);
    }
  });

  it("refuse d'annuler une réservation inconnue (code NOT_FOUND)", async () => {
    fakeBookingRepo.findById = async () => null;

    try {
      await bookingService.cancelBooking("unknown");
      expect.fail("Devrait lever une erreur");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ErrorResponse);
      expect(err.statusCode).toBe(404);
    }
  });
});
