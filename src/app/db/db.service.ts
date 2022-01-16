import { Injectable } from "@angular/core";
import { Dexie, PromiseExtended, Table } from "dexie";
import { Deck, Card, CollectionInfo, Note, Revlog, Model, DeckConf } from "src/sync-client";

export interface ExtendedCollectionInfo extends CollectionInfo {
    mediaUsn: number;
}

@Injectable({ providedIn: "root" })
export class DbService extends Dexie {
    collectionInfo!: Table<ExtendedCollectionInfo, number>;
    decks!: Table<Deck, number>;
    decksConfs!: Table<DeckConf, number>;
    cards!: Table<Card, number>;
    notes!: Table<Note, number>;
    revlogs!: Table<Revlog, number>;
    models!: Table<Model, number>;
    media!: Table<File, string>;

    constructor() {
        super('anki-listen');
        this.version(1).stores({
            collectionInfo: 'id',
            decks: 'id',
            decksConfs: 'id',
            cards: 'id, nid, usn, [did+queue+due]',
            notes: 'id, csum, usn',
            revlogs: 'id, cid, usn',
            models: 'id',
            media: 'name',
        });
        this.on('populate', () => this.populate());
    }

    private async populate() {
        await this.collectionInfo.add({
            id: 1,
            crt: Date.now(),
            mod: 0,
            scm: 0,
            ver: 0,
            dty: 0,
            usn: 0,
            ls: 0,
            mediaUsn: 0,
        });
    }

    getCollectionInfo() {
        return this.collectionInfo.get(1) as PromiseExtended<ExtendedCollectionInfo>;
    }
}