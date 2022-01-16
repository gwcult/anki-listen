import { Injectable } from "@angular/core";
import { Table } from "dexie";
import Dexie from "dexie";
import { Observable, firstValueFrom as toPromise } from "rxjs";
import { Changes, Deck, DeckConf, GravesCollection, Start } from "src/sync-client";
import { DbService } from "../db/db.service";
import { DataSyncApiService } from "./data-sync-api.service";
import { ChunkHelper } from "./services/model-helpers/chunk-helper.model";
import { SyncError } from "./sync-errors";
import { MediaSyncApiService } from "./media-sync-api.service";
import { chunk } from "lodash";

function firstValueFrom<T>(a: Observable<T>) { return Dexie.waitFor(toPromise(a)); }

@Injectable({ providedIn: "root" })
export class SyncService {
    constructor(
        private dataSyncApiService: DataSyncApiService,
        private mediaSyncApiService: MediaSyncApiService,
        private dbService: DbService
    ) { }

    sync(): Promise<any> {
        const tables: Table[] = [
            this.dbService.collectionInfo,
            this.dbService.decks,
            this.dbService.decksConfs,
            this.dbService.cards,
            this.dbService.notes,
            this.dbService.revlogs,
            this.dbService.models,
            this.dbService.media,
        ];
        return this.trySync();
    }

    private async trySync() {
        const collectionInfo = await this.dbService.getCollectionInfo();
        const clientTime = Date.now() / 1000;
        const MAX_TIME_DIFF = 300
        const meta = await firstValueFrom(this.dataSyncApiService.getMeta());
        if (!meta.cont) {
            throw new SyncError.RejectedByServer();
        } else if (Math.abs(clientTime - meta.ts) > MAX_TIME_DIFF) {
            throw new SyncError.TimeDiff(`TimeDiff: ${clientTime}, ${meta.ts}`);
        } else if (collectionInfo.mod === meta.mod) {
            throw new SyncError.NoChanges();
        }
        const emptyGraves: GravesCollection = {
            cards: [],
            notes: [],
            decks: [],
        }
        const startApiParams: Start = {
            minUsn: collectionInfo.usn,
            lnewer: collectionInfo.mod > meta.mod,
            graves: emptyGraves,
        }
        if (collectionInfo.scm !== 0 && collectionInfo.scm !== meta.scm) {
            // clear collection
            startApiParams.minUsn = 0;
        }
        const graves = await firstValueFrom(this.dataSyncApiService.start(startApiParams));
        await this.deleteGraves(graves);
        const emptyChanges: Changes = {
            models: [],
            decks: [[], []],
            tags: [],
        }
        const changes = await firstValueFrom(this.dataSyncApiService.applyChanges(emptyChanges))
        if (changes.crt) {
            collectionInfo.crt = changes.crt;
        }
        this.mergeChanges(changes);
        while (true) {
            const chunk = await firstValueFrom(this.dataSyncApiService.getChunk());
            this.mergeChunk(chunk);
            if (chunk.done) {
                break;
            }
        }
        const emptyChunk: ChunkHelper = {
            done: true,
            notes: [],
            cards: [],
            revlog: [],
        }
        await firstValueFrom(this.dataSyncApiService.applyChunk(emptyChunk));
        const mod = await firstValueFrom(this.dataSyncApiService.finish());
        collectionInfo.mod = mod;
        collectionInfo.ls = mod;
        collectionInfo.usn = meta.usn + 1;
        collectionInfo.scm = meta.scm;
        await this.dbService.collectionInfo.put(collectionInfo);
        const mediaStartResult = await firstValueFrom(this.mediaSyncApiService.start());
        const filesToDownload: string[] = []
        const filesToDelete: string[] = []
        while (true) {
            const items = await firstValueFrom(this.mediaSyncApiService.getChanges(collectionInfo.mediaUsn));
            if (items.length === 0) {
                break;
            }
            for (let i of items) {
                collectionInfo.mediaUsn = i.usn;
                if (i.sum) {
                    filesToDownload.push(i.fileName);
                } else {
                    filesToDelete.push(i.fileName)
                }
            }
        }
        console.log("deleteFiles", filesToDelete);
        await this.dbService.media.where("name").anyOf(filesToDelete).delete();
        console.log("filesToDownload", filesToDownload.length)
        let total = 0
        while (filesToDownload.length > 0) {
            const chunk = filesToDownload.slice(0, 25);
            const files = await firstValueFrom(this.mediaSyncApiService.downloadFiles(chunk));
            console.log("putMedia", files.length);
            filesToDownload.splice(0, files.length);
            total += files.length;
            await this.dbService.media.bulkPut(files);
        }
        console.log("total", total);
        await this.dbService.collectionInfo.put(collectionInfo);
    }

    private deleteGraves(graves: GravesCollection): Promise<[number, number, number]> {
        console.log("deleteGraves", graves);
        return Promise.all([
            this.dbService.decks.where("id").anyOf(graves.cards).delete(),
            this.dbService.notes.where("id").anyOf(graves.notes).delete(),
            this.dbService.cards.where("id").anyOf(graves.cards).delete(),
        ]);
    }

    private mergeChanges(changes: Changes): Promise<[number, number, number]> {
        console.log("mergeChanges", changes);
        const decks = changes.decks[0] as Deck[];
        const decksConfs = changes.decks[1] as DeckConf[];
        return Promise.all([
            this.dbService.models.bulkPut(changes.models),
            this.dbService.decks.bulkPut(decks),
            this.dbService.decksConfs.bulkPut(decksConfs),
        ]);
    }

    private mergeChunk(chunk: ChunkHelper): Promise<[number, number, number]> {
        console.log("mergeChunk", chunk);
        return Promise.all([
            this.dbService.notes.bulkPut(chunk.notes),
            this.dbService.cards.bulkPut(chunk.cards),
            this.dbService.revlogs.bulkPut(chunk.revlog),
        ]);
    }
}
