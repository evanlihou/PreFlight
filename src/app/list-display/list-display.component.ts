import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { liveQuery, Observable } from 'dexie';
import { AppDB, Checklist, ChecklistItem } from 'src/db';

@Component({
  selector: 'app-list-display',
  templateUrl: './list-display.component.html',
  styleUrls: ['./list-display.component.scss']
})
export class ListDisplayComponent implements OnInit, OnChanges {
  @Input() public listId?: number;

  @ViewChild('title') public title!: ElementRef<HTMLInputElement>;

  public listItems$?: Observable<ChecklistItem[]>;
  public list$?: Observable<Checklist | undefined>;

  public editMode = false;

  constructor(private db: AppDB) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listId'] && this.listId !== undefined) {
      this.listItems$ = liveQuery(() => this.db.checklistItems.where('checklistId').equals(this.listId!).toArray());
      this.list$ = liveQuery(() => this.db.checklists.get(this.listId!));
      this.editMode = false;
    }
  }

  public async onStatusToggle(itemId: number) {
    var prevDoneState = (await this.db.checklistItems.get(itemId))?.done;
    await this.db.checklistItems.update(itemId, {done: !prevDoneState});
  }

  public async resetList() {
    if (!this.listId || !confirm("Are you sure you want to mark all items as incomplete?")) return false;

    await this.db.checklistItems.where('checklistId').equals(this.listId!).modify({done: false});

    return true;
  }

  async onAddChecklistItem() {
    const title = this.title.nativeElement.value;
    if (!title || title === '' || !this.listId) return false;

    await this.db.checklistItems.add({
      title,
      checklistId: this.listId
    });
    this.title.nativeElement.value = '';
    return true;
  }

  async onDeleteChecklistItem(id: number) {
    await this.db.checklistItems.delete(id);
  }
}
