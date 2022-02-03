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

let connectionMeta = 'green';
let audioMeta = 'green';
let videoMeta = 'green';
let connections = new Map();

$("#start").addEventListener("click", async (e) => {
  if(!client) initClient();

  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  lsTracks = stream.getTracks().map((mediaStreamTrack) => {
    const meta = mediaStreamTrack.kind === "audio" ? audioMeta : videoMeta;
    return new LSSDK.LSTrack(mediaStreamTrack, stream, {meta: {color: meta}});
  });
  await base.start(lsTracks, {color: connectionMeta});
});

$("#stop").addEventListener("click", async (e) => {
  base.stop();
  client = null;
});

$("#dllog").addEventListener("click", (e) => {
  base.dllog();
});

$("#changemeta").addEventListener("click", async (e) => {
  connectionMeta = connectionMeta === "green" ? "red" : "green";
  $("#connection_meta").innerText = connectionMeta;
  updateConnectionMeta();
});

$("#changeaudiometa").addEventListener("click", async (e) => {
  audioMeta = audioMeta === "green" ? "red" : "green";
  $("#audio_meta").innerText = audioMeta;
  updateTrackMeta('audio', audioMeta);
});

$("#changevideometa").addEventListener("click", async (e) => {
  videoMeta = videoMeta === "green" ? "red" : "green";
  $("#video_meta").innerText = videoMeta;
  updateTrackMeta('video', videoMeta);
});

function initClient() {
  base = new Base();
  client = base.client;

  client.addEventListener("open", (e) => {
    $("#connection_meta").innerText = connectionMeta;
    $("#audio_meta").innerText = audioMeta;
    $("#video_meta").innerText = videoMeta;

    $("#changemeta").disabled = false;
    $("#changeaudiometa").disabled = false;
    $("#changevideometa").disabled = false;
  });

  client.addEventListener("close", (e) => {
    $("#changemeta").disabled = true;
    $("#changeaudiometa").disabled = true;
    $("#changevideometa").disabled = true;
  });

  client.on("addremoteconnection", ({ connection_id, meta }) => {
    connections.set(connection_id, {connection: meta.color, audio: 'green', video: 'green'});
  });

  client.on("removeremoteconnection", ({ connection_id }) => {
    connections.delete('connection_id');
  });

  client.on("updateremoteconnection", ({ connection_id, meta }) => {
    const obj = connections.get(connection_id);
    connections.set(connection_id, {connection: meta.color, video: obj.video, audio: obj.audio});

    const obj2 = connections.get(connection_id);
    const info = `connection:${obj2.connection} video:${obj2.video} audio:${obj2.audio}`;
    $(`#${connection_id}info`).innerText = info;
  });

  client.on("updateremotetrack", ({ connection_id, mediaStreamTrack, stream, meta }) => {
    const obj = connections.get(connection_id);
    if (mediaStreamTrack.kind === "video") {
      connections.set(connection_id, {connection: obj.connection, video: meta.color, audio: obj.audio});
    } else {
      connections.set(connection_id, {connection: obj.connection, video: obj.video, audio: meta.color});
    }
    const obj2 = connections.get(connection_id);
    const info = `connection:${obj2.connection} video:${obj2.video} audio:${obj2.audio}`;
    $(`#${connection_id}info`).innerText = info;
  });
}

function updateConnectionMeta() {
  const state = client.getState();
  if (state !== "open") return;

  client.updateMeta({color: connectionMeta});
}

function updateTrackMeta(kind, meta) {
  const state = client.getState();
  if (state !== "open") return;

  const lsTrack = lsTracks.find(lsTrack => lsTrack.mediaStreamTrack.kind === kind);
  client.updateTrackMeta(lsTrack, { color: meta });

}
