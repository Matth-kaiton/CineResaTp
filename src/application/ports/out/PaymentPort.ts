export interface PaymentPort {
  pay(price: number): Promise<boolean>;
  
}
