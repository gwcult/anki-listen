
export namespace SyncError {
    class Base extends Error { }

    export class RejectedByServer extends Base { }

    export class TimeDiff extends Base { }

    export class NoChanges extends Base { }
}

