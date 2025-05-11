import { ulid } from 'ulid';

export function createUserId(): string {
  return ulid();
}