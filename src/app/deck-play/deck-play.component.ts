import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as dayjs from 'dayjs';
import { Card, Model, Note } from 'src/sync-client';
import { DbService } from '../db/db.service';
import { template } from "lodash";
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { delay, Subject } from 'rxjs';
import { AudioExtractor } from './audio-extractor';

@Component({
  selector: 'app-deck-play',
  templateUrl: './deck-play.component.html',
  styleUrls: ['./deck-play.component.scss']
})
export class DeckPlayComponent implements OnInit {
  @ViewChild('player') player!: ElementRef<HTMLAudioElement>;
  audioEnded$ = new Subject<void>();


  cardIndex: number = 0;
  cardsInDay: number = 0;
  repetition: number = 0;
  repetitionsPerCard: number = 12;

  private daysAdvance = 1;
  private cards: Card[] = [];
  private daysFromCreation = 0;
  currentAudioUrl: SafeUrl | undefined;
  audioFound: boolean | undefined;

  constructor(
    private activatedRoute: ActivatedRoute,
    private db: DbService,
    private audioExtractor: AudioExtractor,
  ) {
    this.audioEnded$.pipe(delay(500)).subscribe(() => {
      this.repetition += 1;
      if (this.repetition == this.repetitionsPerCard) {
        this.repetition = 0;
        this.setCard(this.cardIndex + 1);
      } else {
        this.player.nativeElement.play();
      }
    });
  }

  async ngOnInit() {
    const collectionInfo = await this.db.getCollectionInfo();
    const creationDay = dayjs(collectionInfo.crt).startOf('hour').hour(3);
    const currentDay = dayjs().startOf('hour').hour(3);
    this.daysFromCreation = currentDay.diff(creationDay, 'days');
    this.cards = await this.db.cards.where(["did", "queue", "due"])
      .between(
        [this.deckId, 2, 0],
        [this.deckId, 2, this.daysFromCreation + this.daysAdvance],
        true, true
      ).limit(100).sortBy("due");
    this.cardsInDay = this.cards.length;
    this.setCard(0);
  }

  async setCard(index: number) {
    this.cardIndex = index;
    while (true) {
      if (this.cardIndex >= this.cards.length) {
        this.cardIndex = 0;
        if (this.audioFound !== true) {
          this.audioFound = false;
          return;
        }
      }
      this.currentAudioUrl = await this.audioExtractor.fromCard(this.cards[this.cardIndex]);
      if (this.currentAudioUrl) {
        this.audioFound = true;
        return;
      }
      this.cardIndex += 1;
    }
  }

  get deckId(): number {
    return +this.activatedRoute.snapshot.params["id"];
  }
}
