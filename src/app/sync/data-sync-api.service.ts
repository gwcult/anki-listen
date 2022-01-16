import { Injectable } from "@angular/core"
import { map, Observable } from "rxjs";
import {
    Auth,
    Changes,
    Chunk,
    DataSyncClient,
    GravesCollection,
    Meta,
    PayloadWithAuth,
    SanityParams,
    SanityResult,
    Start,
    Versions
} from "src/sync-client";
import { createPayload } from "./payload.utils";
import { ChunkHelper, chunkToHelper, helperToChunk } from "./services/model-helpers/chunk-helper.model";
import { helperToSanity, SanityHelper } from "./services/model-helpers/sanity-helper.model";
import { SyncLoginService } from "./sync-login.service";
import { CLIENT_VERSION, SYNC_VERSION } from "./versions";

@Injectable({ "providedIn": "root" })
export class DataSyncApiService {
    sessionKey: string | null = null;

    constructor(private dataSyncClient: DataSyncClient, private syncLoginService: SyncLoginService) { }

    getMeta(): Observable<Meta> {
        this.sessionKey = this.generateSessionKey();
        const version: Versions = { v: SYNC_VERSION, cv: CLIENT_VERSION } as unknown as Versions;
        const payload = this.createPayloadWithAuth(version);
        return this.dataSyncClient.getMeta(payload);
    }

    start(start: Start): Observable<GravesCollection> {
        const payload = this.createPayloadWithAuth(start);
        return this.dataSyncClient.start(payload);
    }

    applyChanges(changes: Changes): Observable<Changes> {
        const payload = this.createPayloadWithAuth({ changes: changes });
        return this.dataSyncClient.applyChanges(payload);
    }

    abort(): Observable<void> {
        return this.dataSyncClient.abort(this.createAuth());
    }

    getChunk(): Observable<ChunkHelper> {
        return this.dataSyncClient.chunk(this.createAuth())
            .pipe(map(chunk => chunkToHelper(chunk)));
    }

    applyChunk(chunk: ChunkHelper): Observable<void> {
        const payload = this.createPayloadWithAuth({ chunk: helperToChunk(chunk) });
        return this.dataSyncClient.applyChunk(payload);
    }

    checkSanity(sanity: SanityHelper): Observable<SanityResult> {
        const payload = this.createPayloadWithAuth(helperToSanity(sanity));
        return this.dataSyncClient.sanityCheck2(payload);
    }

    finish(): Observable<number> {
        return this.dataSyncClient.finish(this.createAuth());
    }

    private generateSessionKey() {
        return (Math.random() + 1).toString(36).substring(2, 10);
    }

    private createPayloadWithAuth(data: Record<string, any>): PayloadWithAuth {
        return {
            ...createPayload(data),
            ...this.createAuth(),
        }
    }

    private createAuth(): Auth {
        if (!this.syncLoginService.hostKey$.value || !this.sessionKey) {
            throw new Error('No authentication data');
        }
        return {
            k: this.syncLoginService.hostKey$.value,
            s: this.sessionKey
        }
    }
}