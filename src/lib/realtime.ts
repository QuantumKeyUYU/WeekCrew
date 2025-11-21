import type { CircleMessage, MessageReaction } from '@/types';

type NoopHandler = (event: string, payload: unknown) => void;

export const addRealtimeSubscriber = (_channel: string, _subscriber: NoopHandler) =>
  () => undefined;

export const broadcastRealtimeEvent = (_channel: string, _event: string, _payload: unknown) => undefined;

type SimpleEventHandler = {
  'new-message': (data: CircleMessage) => void;
  typing: (data: { deviceId: string | null; nickname?: string | null }) => void;
  'message-reaction': (data: MessageReaction & { emoji: string }) => void;
};

class SimpleChannel {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_channel: string) {}

  bind<TEvent extends keyof SimpleEventHandler>(_eventName: TEvent, _handler: SimpleEventHandler[TEvent]) {}

  unsubscribe() {
    // noop
  }
}

class SimpleRealtimeClient {
  subscribe(channel: string) {
    return new SimpleChannel(channel);
  }

  unsubscribe(_channel: string) {
    // noop
  }
}

export const pusherClient = new SimpleRealtimeClient();

export const getCircleChannelName = (circleId: string) => `private-circle-${circleId}`;
