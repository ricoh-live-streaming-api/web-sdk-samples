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

let firstPeerID = "";
let firstPeerReq = "required";

$("#start").addEventListener("click", async (e) => {
  if(!client) initClient();

  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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

$("#togglereq").addEventListener("click", async (e) => {
  if (firstPeerID === "") return;
  firstPeerReq = firstPeerReq === "required" ? "unrequired" : "required";
  client.changeMediaRequirements(firstPeerID, firstPeerReq);
  console.log(`set new requirement ${firstPeerReq}`);
});

function initClient() {
  base = new Base();
  client = base.client;

  client.addEventListener("open", (e) => {
    $("#togglereq").disabled = false;

    firstPeerID = "";
    firstPeerReq = "required";
  });
  client.addEventListener("close", (e) => {
    $("#togglereq").disabled = true;

    firstPeerID = "";
    firstPeerReq = "required";
  });
  client.on("addremoteconnection", ({ connection_id, meta }) => {
    if (firstPeerID === "") firstPeerID = connection_id;
  });
}

