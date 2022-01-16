import { Injectable } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Card, Note } from "src/sync-client";
import { DbService } from "../db/db.service";

@Injectable({providedIn: "root"})
export class AudioExtractor {
    soundPattern = /\[sound:(.+?)\]/g;

    constructor(private db: DbService, private domSanitizer: DomSanitizer) { }

    async fromCard(card: Card): Promise<SafeUrl | undefined> {
        const note = await this.db.notes.where("id").equals(card.nid).first() as Note;
        const fileNames = this.fromNote(note);
        for (const name of fileNames) {
            const sound = await this.db.media.where("name").equals(name).first();
            if (sound) {
                const unsafeUrl = URL.createObjectURL(sound);
                return this.domSanitizer.bypassSecurityTrustUrl(unsafeUrl);;
            }
        }
        return undefined
    }

    private fromNote(note: Note): string[] {
        const fields = note.flds.split("\u001f");
        return fields.map(val => this.fromField(val)).flat();
    }

    private fromField(fieldValue: string): string[] {
        return Array.from(fieldValue.matchAll(this.soundPattern)).filter(f => 1 in f).map(f => f[1] as string)
    }
}