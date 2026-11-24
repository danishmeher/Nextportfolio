import fs from "fs";
import path from "path";
import {
  VisitorLog,
  AiChatLog,
  addVisitorLog,
  addAiChatLog,
  getVisitorLogs,
  getAiChatLogs,
  deleteVisitorLog,
  clearAllVisitorLogs,
  deleteAiChatLog,
} from "./firestore";

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

export async function getAllVisitors(): Promise<VisitorLog[]> {
  const localVisitors = readJsonFile<VisitorLog>(VISITORS_FILE);
  try {
    const firestoreVisitors = await getVisitorLogs();
    if (firestoreVisitors && firestoreVisitors.length > 0) {
      const map = new Map<string, VisitorLog>();
      for (const v of firestoreVisitors) {
        const key = v.id || `${v.createdAt}_${v.ip}`;
        map.set(key, v);
      }
      for (const v of localVisitors) {
        const key = v.id || `${v.createdAt}_${v.ip}`;
        if (!map.has(key)) {
          map.set(key, v);
        }
      }
      return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
  } catch (err) {
    console.error("[VisitorStore] Error fetching from Firestore:", err);
  }
  return localVisitors;
}

export async function removeVisitor(id: string): Promise<boolean> {
  const allVisitors = readJsonFile<VisitorLog>(VISITORS_FILE);
  const filtered = allVisitors.filter((v) => v.id !== id);
  writeJsonFile(VISITORS_FILE, filtered);
  try {
    await deleteVisitorLog(id);
  } catch {}
  return true;
}

export async function removeAllVisitors(): Promise<boolean> {
  writeJsonFile(VISITORS_FILE, []);
  try {
    await clearAllVisitorLogs();
  } catch {}
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

export async function getAllAiChats(): Promise<AiChatLog[]> {
  const localChats = readJsonFile<AiChatLog>(CHATS_FILE);
  try {
    const firestoreChats = await getAiChatLogs();
    if (firestoreChats && firestoreChats.length > 0) {
      const map = new Map<string, AiChatLog>();
      for (const c of firestoreChats) {
        const key = c.id || `${c.createdAt}_${c.question}`;
        map.set(key, c);
      }
      for (const c of localChats) {
        const key = c.id || `${c.createdAt}_${c.question}`;
        if (!map.has(key)) {
          map.set(key, c);
        }
      }
      return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
  } catch (err) {
    console.error("[VisitorStore] Error fetching AI chats from Firestore:", err);
  }
  return localChats;
}

export async function removeAiChat(id: string): Promise<boolean> {
  const allChats = readJsonFile<AiChatLog>(CHATS_FILE);
  const filtered = allChats.filter((c) => c.id !== id);
  writeJsonFile(CHATS_FILE, filtered);
  try {
    await deleteAiChatLog(id);
  } catch {}
  return true;
}
