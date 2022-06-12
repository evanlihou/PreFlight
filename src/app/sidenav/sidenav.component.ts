import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AppDB, Checklist } from 'src/db';

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

  @Input() public currentLisstId?: number;

  @ViewChild('title') public title!: ElementRef<HTMLInputElement>;

  constructor(private db: AppDB) { }

  ngOnInit(): void {

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
}
