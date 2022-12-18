import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  @Input() public currentListId?: number;

  @ViewChild('title') public title!: ElementRef<HTMLInputElement>;

  constructor(private db: AppDB, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // this.router.isActive
    // this.route.paramMap.subscribe(params => {
    //   console.log(params);
    //   if (!params.has('listId') || !params.get('listId')) return;
    //   const id = Number.parseInt('listId');
    //   this.currentListId = id;
    // });
  }

  public isIdActive(id: Number) {
    return this.router.isActive(`list/${id}`, {paths: 'exact', queryParams: 'exact', fragment: 'ignored', matrixParams: 'ignored'});
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
}
