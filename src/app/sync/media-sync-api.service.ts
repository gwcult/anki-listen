import { Injectable } from "@angular/core"
import { from, map, Observable, switchMap, tap } from "rxjs";
import {
    DownloadFilesParams,
    GetMediaChangesParams,
    HostKeyAuth,
    MediaSanityParams,
    MediaSanityResult,
    MediaStartResult,
    MediaSyncClient,
    PayloadWithSessionAuth,
    SessionAuth,
    UploadMediaChangesResult
} from "src/sync-client";
import { createPayload } from "./payload.utils";
import { MediaChangesItem, mediaChangesValesToItem } from "./services/model-helpers/media-changes-item.model";
import { SyncLoginService } from "./sync-login.service";
import { CLIENT_VERSION } from "./versions";
import { Unzipped, unzipSync } from 'fflate';

@Injectable({ "providedIn": "root" })
export class MediaSyncApiService {
    constructor(private mediaSyncClient: MediaSyncClient, private syncLoginService: SyncLoginService) { }

    private decoder = new TextDecoder();
    private sessionKey: string | null = null;

    start(): Observable<MediaStartResult> {
        return this.mediaSyncClient.startMediaSync(this.createHostKeyAuth()).pipe(tap(res => this.sessionKey = res.data?.sk || null));
    }

    getChanges(lastUsn: number): Observable<MediaChangesItem[]> {
        const payload = this.createPayloadWithSessionAuth<GetMediaChangesParams>({lastUsn});
        return this.mediaSyncClient.getMediaChanges(payload).pipe(map(changes => {
            if (changes.err) {
                throw new Error(changes.err)
            }
            return (changes.data || []).map(i => mediaChangesValesToItem(i))
        }));
    }

    downloadFiles(fileNames: string[]): Observable<File[]> {
        const payload = this.createPayloadWithSessionAuth<DownloadFilesParams>({files: fileNames});
        return this.mediaSyncClient.downloadFiles(payload).pipe(
            switchMap(zip => from(this.unzipFiles(zip)))
        );
    }

    uploadFiles(files: Blob): Observable<UploadMediaChangesResult> {
        const payload = this.createPayloadWithSessionAuth(files);
        return this.mediaSyncClient.uploadMediaChanges(payload);
    }

    checkSanity(sanity: MediaSanityParams): Observable<MediaSanityResult> {
        const payload = this.createPayloadWithSessionAuth(sanity);
        return this.mediaSyncClient.checkMediaSanity(payload);
    }
    
    private unzipFiles(file: Blob): Promise<File[]> {        
        return file.arrayBuffer().then(buff => {
            const arr = new Uint8Array(buff);
            const unzipped: Unzipped = unzipSync(arr)
            const metaArr = unzipped["_meta"];
            const jsonMeta = this.decoder.decode(metaArr);
            const meta: Record<string, string> = JSON.parse(jsonMeta);
            return Object.entries(meta).map(
                ([zipEntryName, originalFileName]) => new File([unzipped[zipEntryName]], originalFileName)
            );
        });
    }

    private createPayloadWithSessionAuth<T = Record<string, any>>(data: T): PayloadWithSessionAuth {
        return {
            ...createPayload(data),
            ...this.createSessionKeyAuth(),
        }
    }

    private createSessionKeyAuth(): SessionAuth {
        if (!this.sessionKey) {
            throw new Error('No session key');
        }
        return {
            sk: this.sessionKey
        }
    }

    private createHostKeyAuth(): HostKeyAuth {
        if (!this.syncLoginService.hostKey$.value) {
            throw new Error('No host key');
        }
        return {
            k: this.syncLoginService.hostKey$.value,
            v: CLIENT_VERSION
        }
    }
}
