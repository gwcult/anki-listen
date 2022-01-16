import { Card, Chunk, Note, Revlog } from "src/sync-client";

export interface ChunkHelper {
    done: boolean;
    notes: Note[];
    cards: Card[];
    revlog: Revlog[];
}

export function chunkToHelper(chunk: Chunk): ChunkHelper {
    return {
        done: chunk.done,
        notes: chunk.notes.map(i => valuesToNote(i)),
        cards: chunk.cards.map(i => valuesToCard(i)),
        revlog: chunk.revlog.map(i => valuesToRevlog(i))
    };
}

export function helperToChunk(helper: ChunkHelper): Chunk {
    return {
        done: helper.done,
        notes: helper.notes.map(i => Object.values(i)),
        cards: helper.cards.map(i => Object.values(i)),
        revlog: helper.revlog.map(i => Object.values(i)),
    }
}

function valuesToRevlog(values: number[]): Revlog {
    return {
        id: values[0] as number,
        cid: values[1] as number,
        usn: values[2] as number,
        ease: values[3] as number,
        ivl: values[4] as number,
        lastIvl: values[5] as number,
        factor: values[6] as number,
        time: values[7] as number,
        type: values[8] as number,
    };
}

function valuesToNote(values: Array<number | string>): Note {
    return {
        id: values[0] as number,
        guid: values[1] as number,
        mid: values[2] as number,
        mod: values[3] as number,
        usn: values[4] as number,
        tags: values[5] as number,
        flds: values[6] as string,
        sfld: values[7] as number,
        csum: values[8] as number,
        flags: values[9] as number,
        data: values[10] as string,
    };
}

function valuesToCard(values: Array<number | string>): Card {
    return {
        id: values[0] as number,
        nid: values[1] as number,
        did: values[2] as number,
        ord: values[3] as number,
        mod: values[4] as number,
        usn: values[5] as number,
        type: values[6] as number,
        queue: values[7] as number,
        due: values[8] as number,
        ivl: values[9] as number,
        factor: values[10] as number,
        reps: values[11] as number,
        lapses: values[12] as number,
        left: values[13] as number,
        odue: values[14] as number,
        odid: values[15] as number,
        flags: values[16] as number,
        data: values[17] as string,
    };
}
