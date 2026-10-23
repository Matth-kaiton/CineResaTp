import Money from "../shared/Money";

export type Screening = {
  id: string;
  movie: string;
  room: string;
  startsAt: Date;
  capacity: number;
  price: Money;
};
