import Dexie, { Table } from 'dexie';
import {Injectable} from "@angular/core";

export interface Checklist {
  id?: number;
  title: string;
}
export interface ChecklistItem {
  id?: number;
  checklistId: number;
  title: string;
  ordinal?: number;
  done?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AppDB extends Dexie {
  checklistItems!: Table<ChecklistItem, number>;
  checklists!: Table<Checklist, number>;

  constructor() {
    super('preflightDB');
    this.version(1).stores({
      checklists: '++id',
      checklistItems: '++id, checklistId',
    });
    this.on('populate', () => this.populate());
  }

  async populate() {
    const checklistId = await db.checklists.add({
      title: 'To Do Today',
    });
    await db.checklistItems.bulkAdd([
      {
        checklistId,
        title: 'Feed the birds',
      },
      {
        checklistId,
        title: 'Watch a movie',
      },
      {
        checklistId,
        title: 'Have some sleep',
      },
    ]);
  }
}

export const db = new AppDB();
