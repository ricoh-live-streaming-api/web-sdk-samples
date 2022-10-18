/*
 * Copyright 2022 RICOH Company, Ltd. All rights reserved.
 */

"use strict";

import * as LSSDK from "./libs/ricoh-ls-sdk.js";

import { Base } from "./libs/base.js";

const $ = document.querySelector.bind(document);

let base = null;
let client = null;
let lsTracks = [];

const MUTE = "softmute";
// const MUTE = "hardmute"; // hardmuteが良い場合はこちらに変更する
const UNMUTE = "unmute";

let muteStateAudio = UNMUTE;
let muteStateVideo = UNMUTE;

$("#start")?.addEventListener("click", async (e) => {
  if (!client) initClient();

  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  lsTracks = stream.getTracks().map((mediaStreamTrack) => {
    return new LSSDK.LSTrack(mediaStreamTrack, stream, {});
  });
  await base.start(lsTracks);
});

$("#stop")?.addEventListener("click", async (e) => {
  base.stop();
  client = null;
});

$("#dllog")?.addEventListener("click", (e) => {
  base.dllog();
});

$("#audio_mute")?.addEventListener("click", async (e) => {
  muteStateAudio = muteStateAudio === UNMUTE ? MUTE : UNMUTE;
  $("#muteStateAudio").innerText = muteStateAudio;

  mute("audio");
});

$("#video_mute")?.addEventListener("click", async (e) => {
  muteStateVideo = muteStateVideo === UNMUTE ? MUTE : UNMUTE;
  $("#muteStateVideo").innerText = muteStateVideo;

  mute("video");
});

function mute(kind) {
  const state = client?.getState();
  if (state !== "open") return;

  lsTracks.forEach((lsTrack) => {
    const muteState = kind === "audio" ? muteStateAudio : muteStateVideo;
    if (lsTrack.mediaStreamTrack.kind === kind) client?.changeMute(lsTrack, muteState);
  });
}

function initClient() {
  base = new Base();
  client = base.client;

  client.addEventListener("connecting", (e) => {
    $("#status").innerText = "connecting";
  });
  client.addEventListener("open", (e) => {
    $("#status").innerText = "open";

    muteStateAudio = UNMUTE;
    $("#muteStateAudio").innerText = muteStateAudio;
    muteStateVideo = UNMUTE;
    $("#muteStateVideo").innerText = muteStateVideo;
    $("#audio_mute").disabled = false;
    $("#video_mute").disabled = false;
  });
  client.addEventListener("closing", (e) => {
    $("#status").innerText = "closing";
  });
  client.addEventListener("close", (e) => {
    $("#status").innerText = "closed";

    muteStateAudio = UNMUTE;
    muteStateVideo = UNMUTE;
    $("#muteStateAudio").innerText = muteStateAudio;
    $("#audio_mute").disabled = true;
    $("#muteStateVideo").innerText = muteStateVideo;
    $("#video_mute").disabled = true;
  });
  client.on("updatemute", ({ connection_id, mediaStreamTrack, stream, mute }) => {
    $(`#${connection_id}info`).innerText = mute;
  });
}

// for test
function hookClient(c) {
  client = c;
}
function hookLSTracks(lstracks) {
  lsTracks = lstracks;
}
module.exports = {
  mute,
  hookClient,
  hookLSTracks,
};
