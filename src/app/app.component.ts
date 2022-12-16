import {Component, OnInit} from '@angular/core';
import {AppDB, Checklist, ChecklistItem} from "../db";
import {liveQuery, Observable as DexieObservable} from "dexie";
import { map, tap, Observable, shareReplay } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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

  title = 'PreFlight';

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches),
    tap(result => this.mobileMenu = result),
    shareReplay()
  );

  constructor(public db: AppDB, private breakpointObserver: BreakpointObserver) {
  }

  ngOnInit(): void {
    this.checklists$ = liveQuery(() => this.db.checklists.toArray());
  }

  public onListChanged(id: number): void {
    this.currentListId = id;

    console.log('change', id);
  }
}
