import { DomainEvent } from "../../../domain/shared/DomainEvent";

export interface EventPublisher {
  publish(events: DomainEvent[]): Promise<void>;
}
