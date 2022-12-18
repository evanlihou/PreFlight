import { CdkDragSortEvent, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, OnChanges, OnInit, OnDestroy, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { MatList } from '@angular/material/list';
import { ActivatedRoute } from '@angular/router';
import { liveQuery, Observable, Subscription } from 'dexie';
import { AppDB, Checklist, ChecklistItem } from 'src/db';

@Component({
  selector: 'app-list-display',
  templateUrl: './list-display.component.html',
  styleUrls: ['./list-display.component.scss']
})
export class ListDisplayComponent implements OnInit, OnDestroy, OnChanges {
  public listId?: number;

  @ViewChild('title') public title!: ElementRef<HTMLInputElement>;
  @ViewChild('list') public list!: CdkDropList;

  public listItems$?: Observable<ChecklistItem[]>;
  public list$?: Observable<Checklist | undefined>;

  public maxOrdinal: number = 0;
  public listItems: ChecklistItem[] = [];
  public listItemsSub?: Subscription;

  public editMode = false;

  constructor(private db: AppDB, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if (!params.has('listId') || !params.get('listId')) return;
      const id = Number.parseInt(params.get('listId')!);
      if (id === this.listId) return;

      this.listId = id;
      this.listItems$ = liveQuery(() => this.db.checklistItems.where('checklistId').equals(this.listId!).sortBy('ordinal'));
      this.listItemsSub = this.listItems$.subscribe(items => {
        this.listItems = items;
        this.maxOrdinal = Math.max(...items.map(i => i.ordinal ?? 0));
        if (items.length === 0 && !this.editMode) {
          this.editMode = true;
        }
      });
      this.list$ = liveQuery(() => this.db.checklists.get(this.listId!));
      this.editMode = false;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['listId'] && this.listId !== undefined) {
  //     this.listItems$ = liveQuery(() => this.db.checklistItems.where('checklistId').equals(this.listId!).sortBy('ordinal'));
  //     this.listItemsSub = this.listItems$.subscribe(items => this.maxOrdinal = Math.max(...items.map(i => i.ordinal ?? 0)))
  //     this.list$ = liveQuery(() => this.db.checklists.get(this.listId!));
  //     this.editMode = false;
  //   }
  }

  ngOnDestroy(): void {
    this.listItemsSub?.unsubscribe();
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
      checklistId: this.listId,
      ordinal: this.maxOrdinal+1
    });
    this.title.nativeElement.value = '';
    return true;
  }

  async onDeleteChecklistItem(id: number) {
    await this.db.checklistItems.delete(id);
  }

  async onDrop(event: CdkDragSortEvent) {
    moveItemInArray(this.listItems, event.previousIndex, event.currentIndex);
    await this.db.transaction('readwrite', this.db.checklistItems, () => {
      this.listItems.forEach((item, idx) => this.db.checklistItems.update(item.id!, {ordinal: idx}));
    });
    console.log('drop', event);
  }
}
