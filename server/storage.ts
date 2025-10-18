// server/storage.ts
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './firebaseAdmin'; // Hum yeh file agle step me banayenge
import { type Bot, type InsertBot } from "@shared/schema";

const BOTS_COLLECTION = 'bots';

export class FirestoreStorage {
  async getBots(ownerEmail?: string): Promise<Bot[]> {
    const botsRef = collection(db, BOTS_COLLECTION);
    let q;
    if (ownerEmail) {
      q = query(botsRef, where("ownerEmail", "==", ownerEmail));
    } else {
      q = query(botsRef);
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bot));
  }

  async getBot(id: string): Promise<Bot | undefined> {
    const docRef = doc(db, BOTS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Bot) : undefined;
  }

  async createBot(insertBot: InsertBot): Promise<Bot> {
    const docRef = await addDoc(collection(db, BOTS_COLLECTION), {
      ...insertBot,
      uploadedAt: new Date(),
    });
    return { id: docRef.id, ...insertBot, uploadedAt: new Date() };
  }

  async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | undefined> {
    const docRef = doc(db, BOTS_COLLECTION, id);
    await updateDoc(docRef, updates);
    return this.getBot(id);
  }

  async deleteBot(id: string): Promise<boolean> {
    const docRef = doc(db, BOTS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  }
}

export const storage = new FirestoreStorage();
