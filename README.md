## tanstack-playground

tanstack routerとqueryを主にした簡易業務アプリ作成プロジェクト。

### 目的

- tanstack routerおよびqueryの習熟
- search paramとフォーム状態の同期の習熟
- react-hook-form習熟

### TODO

- [ ] チケット機能CRUD実装
  - [ ] List
    - [ ] Page and components 
    - [ ] Search
    - [ ] Query
    - [ ] Test
  - [ ] Detail
    - [ ] Page and components
    - [ ] Mutation
    - [ ] Test
  - [ ] Create
    - [ ] Page and components 
    - [ ] Form
    - [ ] Mutation
    - [ ] Test
  - [ ] Update
    - [ ] Page and components 
    - [ ] Form
    - [ ] Mutation
    - [ ] Test

### 環境変数

- `VITE_API_BASE_URL`: フロントエンドが参照する Backend API のベース URL
  - 開発時は `.env.development` の `http://localhost:7080`
  - 本番時は `.env.production` の Cloud Run URL
- `MODE` / `DEV` / `PROD` は `.env` に定義する値ではなく、Vite が実行時に自動で populate する built-in 値
- ログインに使う初期ユーザーは、バックエンド側の `AUTH_BOOTSTRAP_EMAIL` / `AUTH_BOOTSTRAP_DISPLAY_NAME` / `AUTH_BOOTSTRAP_PASSWORD_BCRYPT` で指定する
