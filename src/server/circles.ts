import { ensureDbConfigured } from "./db";
import type {
  Circle,
  CircleMessage,
  InterestId,
  NewMessageInput,
} from "./types";

export async function getOrCreateCircleByInterest(
  interestId: InterestId
): Promise<Circle> {
  void interestId;
  ensureDbConfigured();
}

export async function listMessages(circleId: string): Promise<CircleMessage[]> {
  void circleId;
  ensureDbConfigured();
}

export async function appendMessage(
  input: NewMessageInput
): Promise<CircleMessage> {
  void input;
  ensureDbConfigured();
}
