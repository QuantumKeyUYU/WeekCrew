import { db, ensureDbConfigured } from "./db";
import type {
  Circle,
  CircleMessage,
  InterestId,
  NewMessageInput,
} from "./types";

type CircleRow = {
  id: number;
  interest_id: string;
  title: string;
  description: string | null;
  created_at: Date;
  expires_at: Date | null;
  member_count: number;
};

type MessageRow = {
  id: number;
  circle_id: number;
  body: string;
  author_device_id: string | null;
  created_at: Date;
};

function mapCircle(row: CircleRow): Circle {
  return {
    id: String(row.id),
    interestId: row.interest_id,
    title: row.title,
    description: row.description ?? undefined,
    createdAt: row.created_at.toISOString(),
    expiresAt: row.expires_at ? row.expires_at.toISOString() : undefined,
    memberCount: row.member_count,
  };
}

function mapMessage(row: MessageRow): CircleMessage {
  return {
    id: String(row.id),
    circleId: String(row.circle_id),
    body: row.body,
    authorDeviceId: row.author_device_id,
    createdAt: row.created_at.toISOString(),
  };
}

// Найти актуальный кружок по интересу или создать новый
export async function getOrCreateCircleByInterest(
  interestId: InterestId
): Promise<Circle> {
  ensureDbConfigured();

  const existing = await db.query<CircleRow>(
    `
    select id, interest_id, title, description, created_at, expires_at, member_count
    from circles
    where interest_id = $1
    order by created_at desc
    limit 1
    `,
    [interestId]
  );

  let row = existing[0];

  if (!row) {
    const title = `Кружок по настроению: ${interestId}`;
    const created = await db.query<CircleRow>(
      `
      insert into circles (interest_id, title, description)
      values ($1, $2, $3)
      returning id, interest_id, title, description, created_at, expires_at, member_count
      `,
      [interestId, title, null]
    );
    row = created[0];
  }

  return mapCircle(row);
}

export async function getCircleById(circleId: string): Promise<Circle | null> {
  ensureDbConfigured();

  const rows = await db.query<CircleRow>(
    `
    select id, interest_id, title, description, created_at, expires_at, member_count
    from circles
    where id = $1
    limit 1
    `,
    [Number(circleId)]
  );

  const row = rows[0];
  return row ? mapCircle(row) : null;
}

// Список сообщений в кружке
export async function listMessages(circleId: string): Promise<CircleMessage[]> {
  ensureDbConfigured();

  const rows = await db.query<MessageRow>(
    `
    select id, circle_id, body, author_device_id, created_at
    from messages
    where circle_id = $1
    order by created_at asc
    `,
    [Number(circleId)]
  );

  return rows.map(mapMessage);
}

// Добавить сообщение
export async function appendMessage(
  input: NewMessageInput
): Promise<CircleMessage> {
  ensureDbConfigured();

  const created = await db.query<MessageRow>(
    `
    insert into messages (circle_id, body, author_device_id)
    values ($1, $2, $3)
    returning id, circle_id, body, author_device_id, created_at
    `,
    [Number(input.circleId), input.body, input.authorDeviceId]
  );

  return mapMessage(created[0]);
}
