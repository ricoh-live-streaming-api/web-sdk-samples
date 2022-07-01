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

const INITIAL_BITRATE = 500;
let bitrateCurrent = INITIAL_BITRATE;

$("#start").addEventListener("click", async (e) => {
  if (!client) initClient();

  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  lsTracks = stream.getTracks().map((mediaStreamTrack) => {
    return new LSSDK.LSTrack(mediaStreamTrack, stream, {});
  });
  bitrateCurrent = INITIAL_BITRATE;
  await base.start(lsTracks, "", {
    sending: { video: { maxBitrateKbps: INITIAL_BITRATE } },
  });
});

$("#stop").addEventListener("click", async (e) => {
  base.stop();
  client = null;
  $("#error").innerText = "";
});

$("#dllog").addEventListener("click", (e) => {
  base.dllog();
});

$("#bitrate_half").addEventListener("click", async (e) => {
  bitrateCurrent = Math.round(bitrateCurrent / 2);
  changeBitrate(bitrateCurrent);
  $("#bitrateState").innerText = bitrateCurrent;
});

$("#bitrate_initial").addEventListener("click", async (e) => {
  bitrateCurrent = INITIAL_BITRATE;
  changeBitrate(bitrateCurrent);
  $("#bitrateState").innerText = bitrateCurrent;
});

// エラーになる例
$("#bitrate_over").addEventListener("click", async (e) => {
   // このようにconnectOptionの値より大きい値を指定するとエラーになります
  changeBitrate(INITIAL_BITRATE + 1);
  $("#bitrateState").innerText = "";

  $("#bitrate_half").disabled = true;
  $("#bitrate_initial").disabled = true;
  $("#bitrate_over").disabled = true;
});

function changeBitrate(bitrate) {
  const state = client.getState();
  if (state !== "open") return;

  client.changeVideoSendBitrate(bitrate);
}

function initClient() {
  base = new Base();
  client = base.client;

  client.addEventListener("connecting", (e) => {
    $("#status").innerText = "connecting";
  });
  client.addEventListener("open", (e) => {
    $("#status").innerText = "open";

    $("#bitrateState").innerText = bitrateCurrent;
    $("#bitrate_half").disabled = false;
    $("#bitrate_initial").disabled = false;
    $("#bitrate_over").disabled = false;
  });
  client.addEventListener("closing", (e) => {
    $("#status").innerText = "closing";
  });
  client.addEventListener("close", (e) => {
    $("#status").innerText = "closed";

    $("#bitrateState").innerText = "";
    $("#bitrate_half").disabled = true;
    $("#bitrate_initial").disabled = true;
    $("#bitrate_over").disabled = true;
  });
}
