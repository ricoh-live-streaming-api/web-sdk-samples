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

document.addEventListener("DOMContentLoaded", async (e) => {
  const addOption = (dom, value, text) => {
    const option = document.createElement("option");
    option.value = value;
    option.text = text;
    dom.appendChild(option);
  }
  const $audioSource = $("#audioSource");
  const $videoSource = $("#videoSource");
  await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  const deviceInfos = await navigator.mediaDevices.enumerateDevices();
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const value = deviceInfo.deviceId;
    if (deviceInfo.kind === "audioinput" && $audioSource) {
      const text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
      addOption($audioSource, value, text);
    } else if (deviceInfo.kind === "videoinput" && $videoSource) {
      const text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      addOption($videoSource, value, text);
    }
  }
});

$("#start").addEventListener("click", async (e) => {
  if(!client) initClient();

  const $audioSource = $("#audioSource");
  const $videoSource = $("#videoSource");
  const audioSource = $audioSource.value;
  const videoSource = $videoSource.value;
  const constraints = {
    video: { deviceId: videoSource ? { exact: videoSource } : undefined, width: 320, height: 240 },
    audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  lsTracks = stream.getTracks().map((mediaStreamTrack) => {
    return new LSSDK.LSTrack(mediaStreamTrack, stream, {});
  });
  await base.start(lsTracks);
});

$("#stop").addEventListener("click", async (e) => {
  base.stop();
  client = null;
});

$("#dllog").addEventListener("click", (e) => {
  base.dllog();
});

$("#chgtrack").addEventListener("click", async (e) => {
  const audioSource = $("#audioSource").value;
  const videoSource = $("#videoSource").value;
  const constraints = {
    video: { deviceId: videoSource ? { exact: videoSource } : undefined, width: 320, height: 240 },
    audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const audio = stream.getAudioTracks()[0];
  const video = stream.getVideoTracks()[0];

  lsTracks.forEach(async (lsTrack) => {
    lsTrack.mediaStreamTrack.stop();
    if (lsTrack.mediaStreamTrack.kind === "audio") await client.replaceMediaStreamTrack(lsTrack, audio);
    else if (lsTrack.mediaStreamTrack.kind === "video") await client.replaceMediaStreamTrack(lsTrack, video);
    else return;
    $("#localStream").srcObject = stream;
  });
});

function initClient() {
  base = new Base();
  client = base.client;

  client.addEventListener("open", (e) => {
    $("#chgtrack").disabled = false;
  });
  client.addEventListener("close", (e) => {
    $("#chgtrack").disabled = true;
  });
}


