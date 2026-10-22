import fs from "fs";

// Format "historique" du fichier db.json (dates en ISO string, prix dans "price")
export type ScreeningRecord = {
  id: string;
  movie: string;
  room: string;
  startsAt: string;
  capacity: number;
  price: number;
};

export type BookingRecord = {
  id: string;
  screeningId: string;
  email: string;
  seats: number;
  tariff: "NORMAL" | "STUDENT";
  total: number;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: string;
  cancelledAt?: string;
};

export type JsonShape = {
  screenings: ScreeningRecord[];
  bookings: BookingRecord[];
};

export class JsonFile {
  constructor(private readonly path: string) {}
  read(): JsonShape {
    return JSON.parse(fs.readFileSync(this.path, "utf-8"));
  }
  write(data: JsonShape): void {
    fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
  }
}
