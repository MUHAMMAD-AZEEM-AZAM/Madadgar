
'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

export interface ChatMessage {
    role: 'user' | 'bot';
    text: string;
    createdAt?: Timestamp;
}

export async function saveMessage(sessionId: string, message: ChatMessage) {
    const messageCollection = collection(db, "chat_sessions", sessionId, "messages");
    await addDoc(messageCollection, {
        ...message,
        createdAt: serverTimestamp(),
    });
}

export async function getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    const messageCollection = collection(db, "chat_sessions", sessionId, "messages");
    const historyQuery = await getDocs(query(messageCollection, orderBy("createdAt", "asc")));
    
    return historyQuery.docs.map(doc => {
        const data = doc.data();
        return {
            role: data.role,
            text: data.text,
        } as ChatMessage;
    });
}
