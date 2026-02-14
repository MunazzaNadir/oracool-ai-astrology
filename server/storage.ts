import { users, messages, type User, type InsertUser, type Message } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  createMessage(userId: number, role: "user" | "assistant", content: string): Promise<Message>;
  getMessages(userId: number): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createMessage(userId: number, role: "user" | "assistant", content: string): Promise<Message> {
    const [message] = await db.insert(messages).values({ userId, role, content }).returning();
    return message;
  }

  async getMessages(userId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(messages.createdAt); // Ascending for chat history
  }
}

export const storage = new DatabaseStorage();
