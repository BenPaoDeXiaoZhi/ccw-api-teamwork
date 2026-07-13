import { TeamworkSocket } from '@ccw-api/teamwork-socket';

interface userInfo {
    avatar: string;
    oid: string;
    clientId: string;
    name: string;
}
declare class Teamwork {
    token: string;
    socket: null | TeamworkSocket;
    projectId: string;
    clientId: string;
    userInfo: userInfo | null;
    constructor(token: string, projectId: string);
    connect(): Promise<object>;
    sendLog(content_: {
        key: string;
        params: object;
    }, operateTarget: "TEAMWORK" | "PROJECT"): Promise<object>;
    sendOpenProjectLog(): Promise<object>;
    sendCloseProjectLog(): Promise<object>;
    dispose(): void;
    sendProfile(profile: {
        editingTargetId: string;
    }): Promise<object>;
    setEditingTarget(editingTargetId: string): Promise<object>;
    sendProjectEvent(type: "assign:other" | "create:other", field: ["gandi", "assets" | "wildExtensions"] | ["targets", string, "comments"], param: object): Promise<object>;
    updateGandiAsset(asset: {
        id: string;
        assetId: string;
        dataFormat: string;
        name: string;
        md5ext?: string;
    }): Promise<object>;
    updateGandiWildExt(id: string, url: string): Promise<object>;
    createGandiAsset(asset: {
        id: string;
        assetId: string;
        dataFormat: string;
        name: string;
        md5ext?: string;
    }): Promise<object>;
    sendRequest(type: string, dat: object): Promise<object>;
    sendBroadcast(type: string, dat: object): void;
    sendScopeMessage(dat: object): Promise<object>;
    sendOpenedGandiAssetsScope(id: string): Promise<object>;
    sendChatMessage(message: string): void;
    createComment(targetId: string, comment: {
        id: string;
        text: string;
        x: number;
        y: number;
        width: number;
        height: number;
        minimized: boolean;
        blockId: null | string;
    }): Promise<object>;
    updateComment(targetId: string, commentDiff: {
        id: string;
        text?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        minimized?: boolean;
        blockId?: null | string;
    }): Promise<object>;
}

export { Teamwork };
