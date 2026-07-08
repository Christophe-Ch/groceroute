import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { filter, map, Observable } from 'rxjs';

interface SyncEvent {
  listId: string;
  actorId: string;
  userIdsToNotify: string[];
}

@Injectable()
export class SyncService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  broadcastUpdate(event: SyncEvent) {
    this.eventEmitter.emit('list.updated', event);
  }

  getUpdateStream(userId: string): Observable<{ data: { listId: string } }> {
    return new Observable<SyncEvent>((subscriber) => {
      const handler = (event: SyncEvent) => subscriber.next(event);

      this.eventEmitter.on('list.updated', handler);

      return () => {
        this.eventEmitter.off('list.updated', handler);
      };
    }).pipe(
      filter((event) => event.userIdsToNotify.includes(userId)),
      map((event) => ({ data: { listId: event.listId } })),
    );
  }
}
