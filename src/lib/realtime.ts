import type { CircleMessage, MessageReaction } from '@/types';

// --- Shared subscriber storage (server) ---
type RealtimeSubscriber = (event: string, payload: unknown) => void;
type SubscriberMap = Map<string, Set<RealtimeSubscriber>>;

type GlobalRealtimeStore = typeof globalThis & {
  __weekcrewRealtimeSubscribers?: SubscriberMap;
};

const getSubscriberStore = (): SubscriberMap => {
  const globalScope = globalThis as GlobalRealtimeStore;
  if (!globalScope.__weekcrewRealtimeSubscribers) {
    globalScope.__weekcrewRealtimeSubscribers = new Map();
  }
  return globalScope.__weekcrewRealtimeSubscribers;
};

const subscribers = getSubscriberStore();

export const addRealtimeSubscriber = (channel: string, subscriber: RealtimeSubscriber) => {
  const channelSubscribers = subscribers.get(channel) ?? new Set<RealtimeSubscriber>();
  channelSubscribers.add(subscriber);
  subscribers.set(channel, channelSubscribers);

  return () => {
    const current = subscribers.get(channel);
    if (!current) return;

    current.delete(subscriber);
    if (!current.size) {
      subscribers.delete(channel);
    }
  };
};

export const broadcastRealtimeEvent = (
  channel: string,
  event: string,
  payload: unknown,
) => {
  const channelSubscribers = subscribers.get(channel);
  if (!channelSubscribers?.size) {
    return;
  }

  channelSubscribers.forEach((handler) => {
    try {
      handler(event, payload);
    } catch (error) {
      console.error('Realtime handler failed', error);
    }
  });
};

// --- Client-side EventSource wrapper ---
type SimpleEventHandler = {
  'new-message': (data: CircleMessage) => void;
  typing: (data: { deviceId: string | null; nickname?: string | null }) => void;
  'message-reaction': (data: MessageReaction & { emoji: string }) => void;
};

class SimpleChannel {
  private readonly eventSource: EventSource | null;

  private listeners: { event: keyof SimpleEventHandler; listener: EventListener }[] = [];

  constructor(channel: string) {
    if (typeof window === 'undefined') {
      this.eventSource = null;
      return;
    }

    const url = `/api/realtime?channel=${encodeURIComponent(channel)}`;
    this.eventSource = new EventSource(url);
    this.eventSource.addEventListener('error', (event) => {
      console.warn('Realtime connection issue', event);
    });
  }

  bind<TEvent extends keyof SimpleEventHandler>(
    eventName: TEvent,
    handler: SimpleEventHandler[TEvent],
  ) {
    if (!this.eventSource) {
      return;
    }

    const listener: EventListener = (event) => {
      const message = event as MessageEvent<string>;
      const raw = message.data ?? '';
      let payload: unknown = raw;
      try {
        payload = raw ? JSON.parse(raw) : null;
      } catch (error) {
        console.warn('Failed to parse realtime payload', error);
      }
      handler(payload as Parameters<SimpleEventHandler[TEvent]>[0]);
    };

    this.listeners.push({ event: eventName, listener });
    this.eventSource.addEventListener(eventName, listener);
  }

  unsubscribe() {
    if (this.eventSource) {
      this.listeners.forEach(({ event, listener }) => {
        this.eventSource?.removeEventListener(event, listener);
      });
      this.eventSource.close();
    }
    this.listeners = [];
  }
}

class SimpleRealtimeClient {
  subscribe(channel: string) {
    return new SimpleChannel(channel);
  }

  unsubscribe(_channel: string) {
    // noop, handled by SimpleChannel.unsubscribe
  }
}

export const pusherClient = new SimpleRealtimeClient();

export const getCircleChannelName = (circleId: string) => `private-circle-${circleId}`;
