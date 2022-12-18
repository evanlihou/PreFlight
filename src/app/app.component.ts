import {Component, OnInit, ViewChild} from '@angular/core';
import {AppDB, Checklist, ChecklistItem} from "../db";
import {liveQuery, Observable as DexieObservable} from "dexie";
import { map, Observable, shareReplay } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public checklists$?: DexieObservable<Checklist[]>;

  public currentListId?: number;
  public currentListItems$?: DexieObservable<ChecklistItem[]>;

  public mobileMenu: boolean = false;

  @ViewChild("drawer") drawer?: MatSidenav;

  title = 'PreFlight';

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches),
    shareReplay()
  );

  constructor(public db: AppDB, private breakpointObserver: BreakpointObserver) {
  }

  ngOnInit(): void {
    this.checklists$ = liveQuery(() => this.db.checklists.toArray());
    this.isHandset$.subscribe(isHandset => {
      this.mobileMenu = isHandset;
      if (!isHandset && !this.drawer?.opened) this.drawer?.open();
    });
  }
}
