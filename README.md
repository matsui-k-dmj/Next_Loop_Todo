# Loop Todo

https://loop-todo-dev.web.app

ルーティン (筋トレなど) の繰り返し条件を設定して、日ごとの Todo を作成する Web アプリ。

- 日, 週, 月ごとに繰り返せる
- まず匿名認証を行い、Google で ログインしたあとは、異なるデバイスでもデータを共有できる。データの変更はリアルタイムに反映される。

## 使用した技術

- TypeScript
  - React
  - NextJS (CSR しか使っていないが、慣れるために使用した。)
  - emotion
  - date-fns
  - React DnD (ドラッグ & ドロップ)
- Firebase
  - Authentication (匿名認証, Google でのログイン)
  - Realtime database

## コマンドなど

- npm run dev
  - 開発サーバの実行
- npm run fbe
  - firebase emulator の実行
- npm run prev
  - format, lint, build を行って、firebase hosting の preview チャンネルにデプロイする
- npm run clone
  - preview チャンネルを 本番環境にコピーする。

## 実装概要

### Firebase

API キーなどは .env.local などで環境変数としてあたえる。
lib/firebaseConfig で読み込んでいる。

```
NEXT_PUBLIC_apiKey=
NEXT_PUBLIC_authDomain=
NEXT_PUBLIC_projectId=
NEXT_PUBLIC_storageBucket=
NEXT_PUBLIC_messagingSenderId=
NEXT_PUBLIC_appId=
NEXT_PUBLIC_databaseURL=
```

### 認証

contexts/AuthContext にまとめた。

- 匿名認証, データの初期化
- Google でのアカウント作成
- すでにアカウント作成を作成している場合のログイン
- 現在のユーザの保持

### Realtime database との接続

rtdb のイベントリスナーは contexts/FirebaseContext にまとめた。他のコンポーネントはこの context を参照すれば、何度も rtdb からデータをダウンロードする必要がなくなる。

書き込みはそれぞれのコンポーネントで行った。

### ルーティン管理

主に pages/routines と components/RoutineDetail にある。

- React DnD でのドラッグ&ドロップ
- Routine の新規追加
- 繰り返し設定など

### Todo 実行

主に pages/index と components/Todo にある。

- React DnD でのドラッグ&ドロップ
- 繰り返し判定
- チェックした todo のソートなど

### 繰り返し設定

- components/RoutineDetail: 繰り返し設定の書き込み
- components/RepeatText: 繰り返し設定の文字列表現
- lib/repeats: 繰り返し判定のロジック

### テスト

- 繰り返し判定のロジックのテストを \_\_test\_\_/repeats.ts で行っている
- 認証情報の削除、匿名認証とデータの初期化だけ cypress で行っている。
