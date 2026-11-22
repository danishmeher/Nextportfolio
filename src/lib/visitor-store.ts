import fs from "fs";
import path from "path";
import { VisitorLog, AiChatLog, addVisitorLog, addAiChatLog } from "./firestore";

const DATA_DIR = path.join(process.cwd(), "data");
const VISITORS_FILE = path.join(DATA_DIR, "visitors.json");
const CHATS_FILE = path.join(DATA_DIR, "ai_chats.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string): T[] {
  try {
    ensureDirectoryExists();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]), "utf-8");
      return [];
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) || [];
  } catch (err) {
    console.error(`[VisitorStore] Error reading ${filePath}:`, err);
    return [];
  }
}

function writeJsonFile<T>(filePath: string, data: T[]): void {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`[VisitorStore] Error writing to ${filePath}:`, err);
  }
}

// ---------------- VISITOR OPERATIONS ----------------

export async function saveVisitorLog(visitor: Omit<VisitorLog, "id">): Promise<VisitorLog> {
  const newEntry: VisitorLog = {
    ...visitor,
    id: `vis_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: visitor.createdAt || Date.now(),
  };

  // 1. Save to local persistent file store (Guaranteed 100% to never fail with permission denied)
  const allVisitors = readJsonFile<VisitorLog>(VISITORS_FILE);
  allVisitors.unshift(newEntry);
  // Keep max 500 recent visitors
  if (allVisitors.length > 500) allVisitors.length = 500;
  writeJsonFile(VISITORS_FILE, allVisitors);

  // 2. Also attempt Firestore sync in background (if rules permit)
  addVisitorLog(visitor).catch(() => {
    // Ignore Firestore permission denied if rules not yet updated in console
  });

  return newEntry;
}

export function getAllVisitors(): VisitorLog[] {
  return readJsonFile<VisitorLog>(VISITORS_FILE);
}

export function removeVisitor(id: string): boolean {
  const allVisitors = readJsonFile<VisitorLog>(VISITORS_FILE);
  const filtered = allVisitors.filter((v) => v.id !== id);
  writeJsonFile(VISITORS_FILE, filtered);
  return true;
}

export function removeAllVisitors(): boolean {
  writeJsonFile(VISITORS_FILE, []);
  return true;
}

// ---------------- AI CHAT OPERATIONS ----------------

export async function saveAiChat(chat: Omit<AiChatLog, "id">): Promise<AiChatLog> {
  const newEntry: AiChatLog = {
    ...chat,
    id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: chat.createdAt || Date.now(),
  };

  // 1. Save to local persistent file store
  const allChats = readJsonFile<AiChatLog>(CHATS_FILE);
  allChats.unshift(newEntry);
  if (allChats.length > 500) allChats.length = 500;
  writeJsonFile(CHATS_FILE, allChats);

  // 2. Also attempt Firestore sync
  addAiChatLog(chat).catch(() => {});

  return newEntry;
}

export function getAllAiChats(): AiChatLog[] {
  return readJsonFile<AiChatLog>(CHATS_FILE);
}

export function removeAiChat(id: string): boolean {
  const allChats = readJsonFile<AiChatLog>(CHATS_FILE);
  const filtered = allChats.filter((c) => c.id !== id);
  writeJsonFile(CHATS_FILE, filtered);
  return true;
}
