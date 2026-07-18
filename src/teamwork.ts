import { TeamworkSocket, getRandomClientId } from "@ccw-api/teamwork-socket";

export interface userInfo {
  avatar: string;
  oid: string;
  clientId: string;
  name: string;
}

export class Teamwork {
  ticket: string;
  socket: null | TeamworkSocket = null;
  projectId: string;
  clientId: string = getRandomClientId();
  userInfo: userInfo;
  /**
   * @param ticket teamwork ticket
   * @param projectId project oid
   * @param oid user id
   * @param avatar avatar url
   * @param name user name
   */
  constructor(
    ticket: string,
    projectId: string,
    oid: string,
    avatar: string = "https://m.xiguacity.cn/icon/new_avatar.png",
    name = "BOT",
  ) {
    this.ticket = ticket;
    this.projectId = projectId;
    this.userInfo = {
      avatar,
      oid,
      clientId: this.clientId,
      name,
    };
  }

  async connect(): Promise<object> {
    this.socket = new TeamworkSocket(
      this.projectId,
      this.userInfo.oid,
      this.ticket,
      this.clientId,
      this.userInfo.name,
      this.userInfo.avatar,
      5000,
    );
    return new Promise((resolve) => {
      this.socket!.addEventListener("connected", (e) =>
        resolve((e as any).data as object),
      );
    });
  }

  sendLog(
    content_: {
      key: string;
      params: object;
    },
    operateTarget: "TEAMWORK" | "PROJECT",
  ) {
    const content = Object.assign(content_, { operator: this.userInfo });
    return this.sendRequest("log", {
      content,
      operateTarget,
    });
  }

  sendOpenProjectLog() {
    if (!this.userInfo) {
      throw new Error("socket userInfo is not initialized!");
    }
    return this.sendLog(
      {
        key: "openedProject",
        params: {
          name: this.userInfo.name,
        },
      },
      "TEAMWORK",
    );
  }

  sendCloseProjectLog() {
    if (!this.userInfo) {
      throw new Error("socket userInfo is not initialized!");
    }
    return this.sendLog(
      {
        key: "closedProject",
        params: {
          name: this.userInfo.name,
        },
      },
      "TEAMWORK",
    );
  }

  dispose() {
    if (!this.socket) {
      throw new Error("socket is not initialized!");
    }
    this.socket.dispose();
  }

  sendProfile(profile: { editingTargetId: string }) {
    return this.sendRequest("profile", profile);
  }

  setEditingTarget(editingTargetId: string) {
    return this.sendProfile({
      editingTargetId,
    });
  }

  sendProjectEvent(
    type: "assign:other" | "create:other",
    field:
      | ["gandi", "assets" | "wildExtensions"]
      | ["targets", string, "comments"],
    param: object,
  ) {
    if (!this.userInfo) {
      throw new Error("socket userInfo is not initialized!");
    }
    const data = {
      author: this.userInfo.oid,
      events: [[type, field, param]],
    };
    return this.sendRequest("project", data);
  }

  updateGandiAsset(asset: {
    id: string;
    assetId: string;
    dataFormat: string;
    name: string;
    md5ext?: string;
  }) {
    asset.md5ext ??= `${asset.assetId}.${asset.dataFormat}`;
    return this.sendProjectEvent("assign:other", ["gandi", "assets"], asset);
  }

  updateGandiWildExt(id: string, url: string) {
    return this.sendProjectEvent("assign:other", ["gandi", "wildExtensions"], {
      id,
      url,
    });
  }

  createGandiAsset(asset: {
    id: string;
    assetId: string;
    dataFormat: string;
    name: string;
    md5ext?: string;
  }) {
    asset.md5ext ??= `${asset.assetId}.${asset.dataFormat}`;
    return this.sendProjectEvent("create:other", ["gandi", "assets"], asset);
  }

  sendRequest(type: string, dat: object) {
    if (!this.socket) {
      throw new Error("socket is not initialized!");
    }
    return this.socket.sendRequest(type, dat);
  }

  sendBroadcast(type: string, dat: object) {
    if (!this.socket) {
      throw new Error("socket is not initialized!");
    }
    return this.socket.sendBroadcast(type, dat);
  }

  sendScopeMessage(dat: object) {
    return this.sendRequest("scope", dat);
  }

  sendOpenedGandiAssetsScope(id: string) {
    return this.sendScopeMessage(["gandi", "assets", id]);
  }

  sendChatMessage(message: string) {
    if (!this.userInfo) {
      throw new Error("socket userInfo is not initialized!");
    }
    return this.sendBroadcast("forward", {
      chatMessage: [this.userInfo.clientId, message],
    });
  }

  createComment(
    targetId: string,
    comment: {
      id: string;
      text: string;
      x: number;
      y: number;
      width: number;
      height: number;
      minimized: boolean;
      blockId: null | string;
    },
  ) {
    return this.sendProjectEvent(
      "create:other",
      ["targets", targetId, "comments"],
      comment,
    );
  }

  updateComment(
    targetId: string,
    commentDiff: {
      id: string;
      text?: string;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      minimized?: boolean;
      blockId?: null | string;
    },
  ) {
    return this.sendProjectEvent(
      "assign:other",
      ["targets", targetId, "comments"],
      commentDiff,
    );
  }
}
