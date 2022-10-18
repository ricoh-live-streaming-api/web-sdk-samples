/*
 * Copyright 2022 RICOH Company, Ltd. All rights reserved.
 */

import * as LSSDK from "./ricoh-ls-sdk.js";
import { Credentials } from "./credential.js";
import { IDs } from "./ids.js";

const $ = document.querySelector.bind(document);

class Base {
  lsTracks = [];
  client = null;

  constructor() {
    this.client = new LSSDK.Client();
    this.client.addEventListener("open", (e) => {
      console.log(this.client.getState());
    });
    this.client.addEventListener("close", (e) => {
      console.log(this.client.getState());
    });
    this.client.addEventListener("error", (e) => {
      console.error(e.detail);
      $("#error").innerText = `Error: ${e.detail.error}`;
    });
    this.client.addEventListener("addlocaltrack", (e) => {
      const { stream, mediaStreamTrack } = e.detail;
      $("#localStream").srcObject = stream;
    });
    this.client.on("addremotetrack", async ({ connection_id, mediaStreamTrack, stream, meta, mute }) => {
      let $video = $(`#${connection_id}`);
      if ($video === null) {
        let $container = document.createElement("div");
        $container.id = connection_id + "container";
        $video = document.createElement("video");
        $video.id = connection_id;
        $container.appendChild($video);
        let $video_info = document.createElement("div");
        $video_info.id = connection_id + "info";
        $container.appendChild($video_info);
        $("#remote-streams").appendChild($container);
      }
      if ($video.srcObject) $video.srcObject.addTrack(mediaStreamTrack);
      else $video.srcObject = stream;
      await $video.play();
    });
    this.client.on("removeremoteconnection", ({ connection_id, meta, mediaStreamTrack }) => {
      let $container = $(`#${connection_id}container`);
      if ($container === null) return;

      const video = $container.firstChild;
      if(video) {
        video.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
        video.srcObject = null;
      }
      $("#remote-streams").removeChild($container);
    });
  }

  accessToken(CLIENT_SECRET, room_spec) {
    /*
    注意: 本関数はサンプル専用ですので実運用では使用できません。
    実運用に際しては、AccessTokenはバックエンドサーバ内で生成し、
    CLIENT_SECRETを隠蔽してください。
  */
    const header = {
      alg: "HS256",
      cty: "JWT",
    };
    const now = Math.floor(Date.now() / 1000); // sec(epoch)
    const payload = {
      nbf: KJUR.jws.IntDate.get((now - 60 * 30).toString()),
      exp: KJUR.jws.IntDate.get((now + 60 * 30).toString()),
      connection_id: IDs.APP_ID + btoa(Math.random()).replace(/=/g, ""),
      room_id: "room1",
      room_spec: room_spec,
    };
    const accessToken = KJUR.jws.JWS.sign(null, header, payload, CLIENT_SECRET);
    return accessToken;
  }

  async start(lsTracks, meta = "", sending = {}, receiving = {}) {
    this.lsTracks = lsTracks;

    const room_spec = {
      type: "sfu",
      media_control: {
        bitrate_reservation_mbps: 25
      }
    };
    const access_token = this.accessToken(Credentials.CLIENT_SECRET, room_spec);
    try {
      const option = { localLSTracks: this.lsTracks };
      if (meta !== "") option.meta = meta;
      if (Object.keys(sending).length !== 0) option.sending = sending;
      if (Object.keys(receiving).length !== 0) option.receiving = receiving;
      if (Credentials.SIGNALING_URL) option.signalingURL = Credentials.SIGNALING_URL;
      this.client.connect(Credentials.CLIENT_ID, access_token, option);
    } catch (e) {
      console.error(e);
      $("#error").innerText = `Error: ${e.detail.error}`;
    }
    $("#start").disabled = true;
    $("#stop").disabled = false;
  }

  stop() {
    $("#remote-streams").textContent = "";
    $("#localStream").srcObject = null;

    this.lsTracks.forEach((lsTrack) => {
      lsTrack.mediaStreamTrack.stop();
    });
    this.client.disconnect();
    $("#start").disabled = false;
    $("#stop").disabled = true;
  }

  dllog() {
    const result = this.client.getHeadReport() + this.client.getTailReport();
    const downLoadLink = document.createElement("a");
    downLoadLink.download = "log.txt";
    downLoadLink.href = URL.createObjectURL(new Blob([result], { type: "text.plain" }));
    downLoadLink.dataset.downloadurl = ["text/plain", downLoadLink.download, downLoadLink.href].join(":");
    downLoadLink.click();
  }
}

export { Base };
