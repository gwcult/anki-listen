export interface MediaChangesItem {
    fileName: string;
    usn: number;
    sum: string | null;
}

export function mediaChangesValesToItem(values: Array<number | string>): MediaChangesItem {
    return {
        fileName: values[0] as string,
        usn: values[1] as number,
        sum: values[2] as string,
    }

}