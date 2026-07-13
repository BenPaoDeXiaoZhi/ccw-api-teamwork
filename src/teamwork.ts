import { communityWeb } from "@ccw-api/api";
import { TeamworkSocket, getRandomClientId } from "@ccw-api/teamwork-socket";

export interface userInfo {
  avatar: string;
  oid: string;
  clientId: string;
  name: string;
}

export class Teamwork {
  token: string;
  socket: null | TeamworkSocket = null;
  projectId: string;
  clientId: string = getRandomClientId();
  userInfo: userInfo | null;
  constructor(token: string, projectId: string) {
    this.token = token;
    this.projectId = projectId;
  }

  async connect(): Promise<void> {
    const { avatar, name, oid } = await communityWeb.getStudentSelfDetail(
      false,
      false,
      [],
    );
    this.userInfo = {
      avatar,
      oid,
      clientId: this.clientId,
      name,
    };
    const ticket = await communityWeb.produceTeamMemberTicket(this.projectId);
    this.socket = new TeamworkSocket(
      this.projectId,
      oid,
      ticket,
      this.clientId,
      name,
      avatar,
      5000,
    );
    return new Promise((resolve) => {
      this.socket.addEventListener("connected", () => resolve());
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
    return this.socket.sendRequest("log", {
      content,
      operateTarget,
    });
  }

  sendOpenProjectLog() {
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
    this.socket.dispose();
  }

  sendProfile(profile: { editingTargetId: string }) {
    return this.socket.sendRequest("profile", profile);
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
    const data = {
      author: this.userInfo.oid,
      events: [[type, field, param]],
    };
    return this.socket.sendRequest("project", data);
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

  sendScopeMessage(dat: object) {
    return this.socket.sendRequest("scope", dat);
  }

  sendOpenedGandiAssetsScope(id: string) {
    return this.sendScopeMessage(["gandi", "assets", id]);
  }

  sendChatMessage(message: string) {
    return this.socket.sendBroadcast("forward", {
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
