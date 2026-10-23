// Un domain event décrit un fait métier passé, nommé au passé, immuable
export interface DomainEvent {
  readonly type: string;
  readonly occurredAt: Date;
}
