import { SanityParams } from "src/sync-client";

export interface SanityHelper {
    schedule: {
        new: number,
        lrn: number,
        rev: number,
    }
    cards: number,
    notes: number,
    revlog: number,
    graves: number,
    models: number,
    decks: number,
    decksConfs: number,
}

export function helperToSanity(helperModel: SanityHelper): SanityParams {
    return valuesDeep(helperModel);
}

function valuesDeep(x: any): any {
    return typeof x !== 'object' ? x : Object.values(x).map(i => valuesDeep(x));
}