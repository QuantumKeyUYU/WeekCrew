import type { CircleMessage, MessageReaction } from '@/types';

type ChannelSubscriber = (event: string, payload: unknown) => void;

type ChannelMap = Map<string, Set<ChannelSubscriber>>;

const getChannelMap = (): ChannelMap => {
  const globalWithChannels = globalThis as typeof globalThis & {
    __weekcrewChannels?: ChannelMap;
  };

  if (!globalWithChannels.__weekcrewChannels) {
    globalWithChannels.__weekcrewChannels = new Map();
  }

  return globalWithChannels.__weekcrewChannels;
};

export const addRealtimeSubscriber = (channel: string, subscriber: ChannelSubscriber) => {
  const channels = getChannelMap();
  const subscribers = channels.get(channel) ?? new Set<ChannelSubscriber>();
  subscribers.add(subscriber);
  channels.set(channel, subscribers);

  return () => {
    const nextSubscribers = channels.get(channel);
    if (!nextSubscribers) return;
    nextSubscribers.delete(subscriber);
    if (nextSubscribers.size === 0) {
      channels.delete(channel);
    }
  };
};

export const broadcastRealtimeEvent = (channel: string, event: string, payload: unknown) => {
  const channels = getChannelMap();
  const subscribers = channels.get(channel);
  if (!subscribers || subscribers.size === 0) return;
  subscribers.forEach((subscriber) => subscriber(event, payload));
};

type SimpleEventHandler = {
  'new-message': (data: CircleMessage) => void;
  typing: (data: { deviceId: string | null; nickname?: string | null }) => void;
  'message-reaction': (data: MessageReaction & { emoji: string }) => void;
};

class SimpleChannel {
  private source: EventSource | null = null;

  private bindings = new Map<string, Set<(data: CircleMessage | MessageReaction | object) => void>>();

  constructor(channel: string) {
    if (typeof window === 'undefined') {
      return;
    }
    this.source = new EventSource(`/api/realtime?channel=${encodeURIComponent(channel)}`);
    ['new-message', 'typing', 'message-reaction'].forEach((eventName) => {
      this.source?.addEventListener(eventName, (event) => {
        try {
          const payload = JSON.parse((event as MessageEvent).data);
          this.emit(eventName, payload as CircleMessage);
        } catch (error) {
          console.warn('Failed to parse live event', error);
        }
      });
    });
  }

  bind<TEvent extends keyof SimpleEventHandler>(eventName: TEvent, handler: SimpleEventHandler[TEvent]) {
    const existing = this.bindings.get(eventName) ?? new Set<(data: CircleMessage | MessageReaction | object) => void>();
    existing.add(handler);
    this.bindings.set(eventName, existing);
  }

  unsubscribe() {
    this.source?.close();
    this.bindings.clear();
  }

  private emit(eventName: string, payload: CircleMessage | MessageReaction | object) {
    const handlers = this.bindings.get(eventName);
    handlers?.forEach((handler) => handler(payload));
  }
}

class SimpleRealtimeClient {
  subscribe(channel: string) {
    return new SimpleChannel(channel);
  }

  unsubscribe(channel: string) {
    // noop: handled per channel instance
  }
}

export const pusherClient =
  typeof window !== 'undefined' ? new SimpleRealtimeClient() : (null as unknown as SimpleRealtimeClient);

export const getCircleChannelName = (circleId: string) => `private-circle-${circleId}`;
