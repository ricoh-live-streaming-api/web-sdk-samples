# SDK の API をそれぞれ用いたサンプル

RICOH Live Streaming Client SDK for Web を使用した Web サンプルアプリケーションです。

サービスのご利用には、API利用規約への同意とアカウントの登録、ソフトウェア利用許諾書への同意が必要です。
詳細は下記Webサイトをご確認ください。

* サービスサイト: https://livestreaming.ricoh/
  * ソフトウェア開発者向けサイト: https://api.livestreaming.ricoh/
* ソフトウェア使用許諾契約書 : [Software License Agreement](../SoftwareLicenseAgreement.txt)

* NOTICE: This package includes SDK and sample application(s) for "RICOH Live Streaming Service".
At this moment, we provide API license agreement / software license agreement only in Japanese.

## 事前準備
* Client ID, Secret の設定  
各サンプルの libs 下に credential.template.jsを参考に、credential.js を作成し Client ID, Secret を設定する。  
``` JavaScript
export const Credentials = {
  CLIENT_ID: "Exsample_ClientID_0123456789",
  CLIENT_SECRET: "Exsample_ClientSecret_0123456789"
};
```

## 使用方法

各サンプルディレクトリで下記のコマンドでブラウザを起動して下さい。

```sh
$ npm install
$ npm run start
```

## サンプル一覧
サンプルの詳細は各リンク先を参照

| サンプル                   | 概要                                            | Client SDK API                                                                                                                              |
| -------------------------- | --------------------------------------------  | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [device](./device)         | カメラ、マイク、スピーカーのデバイス検出と切り替え   | Client#ReplaceMediaStreamTrack|
| [meta](./meta)             | Connection/Track Metadata 更新通知の送受信     | Client#UpdateMeta<br>Client#UpdateTrackMeta|
| [mute](./mute)             | ミュート状態の変更とミュート状態更新通知の送受信      | Client#ChangeMute<br>|
| [selective](./selective)   | 相手映像の選択受信設定                           | Client#ChangeMediaRequirements  |