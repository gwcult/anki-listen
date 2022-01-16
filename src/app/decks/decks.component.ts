import { Component, OnInit } from '@angular/core';
import { liveQuery } from 'dexie';
import { DbService } from '../db/db.service';

@Component({
  selector: 'app-decks',
  templateUrl: './decks.component.html',
  styleUrls: ['./decks.component.scss']
})
export class DecksComponent implements OnInit {
  decks$ = liveQuery(() => this.db.decks.toArray());

  constructor(private db: DbService) { }

  ngOnInit(): void {
  }

}
