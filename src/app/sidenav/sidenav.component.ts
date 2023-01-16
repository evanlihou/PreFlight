import { CdkDragSortEvent } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AppDB, Checklist } from 'src/db';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../common/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Output()
  public listChanged: EventEmitter<number> = new EventEmitter<number>();

  @Input()
  public lists: Checklist[] | null = null;

  @Input() public currentListId?: number;

  @ViewChild('title') public title!: ElementRef<HTMLInputElement>;

  public editMode: boolean = false;

  constructor(
    private db: AppDB,
    private router: Router,
    private dialog: MatDialog
    ) { }

  ngOnInit(): void {
  }

  public isIdActive(id: Number) {
    return this.router.isActive(`list/${id}`, {
      paths: 'exact',
      queryParams: 'exact',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  async onClickAddChecklist() {
    const title = this.title.nativeElement.value;
    if (!title || title === '') return false;
    await this.db.checklists.add({
      title
    });
    this.title.nativeElement.value = '';
    return true;
  }

  async onSelectChecklist(id: number) {
    this.router.navigate(['/list', id]);
    this.currentListId = id;
    this.listChanged.emit(id);
  }

  async onDrop(event: CdkDragSortEvent) {
    console.log(event);
  }

  async onClickDelete(listId: number, event: MouseEvent) {
    if (!this.editMode) return;
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        content: `Are you sure you want to delete "${this.lists?.find(x => x.id === listId)?.title}" and all of its items?`,
        continueText: 'Delete',
        isDestructive: true
      } as ConfirmationDialogData
    });
    dialogRef.afterClosed().subscribe(async result => {
      if (result !== true) return;

      await this.db.transaction('rw', this.db.checklists, this.db.checklistItems, async () => {
        await this.db.checklistItems.where('checklistId').equals(listId).delete();
        await this.db.checklists.delete(listId);
      });
    })
  }
}
