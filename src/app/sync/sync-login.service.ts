import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable, tap } from "rxjs";
import { Credentials, HostKey } from "src/sync-client";
import { LogInClient } from "src/sync-client/api/log-in.client";
import { createPayload } from "./payload.utils";

@Injectable({ "providedIn": "root" })
export class SyncLoginService {
    hostKey$ = new BehaviorSubject<string | null>(this.loadKey());

    constructor(private logInClient: LogInClient) {}

    logIn(credentials: Credentials): Observable<HostKey> {
        const payload = createPayload(credentials);
        return this.logInClient.getHostKey(payload).pipe(
            tap(res => {
                const key = res.key || null;
                if (key) {
                    localStorage.setItem("hostKey", key);
                }
                this.hostKey$.next(key);
            })
        );
    }

    loadKey() {
        return localStorage.getItem("hostKey");
    }
}
