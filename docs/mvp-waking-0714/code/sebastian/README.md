# SEBASTIAN — Wake Sequence UI (v1)

モバイルファーストの生活状態オーケストレーター `Steward` と起床シーケンスの第一リリース向け実装案。
Next.js (App Router) + React + TypeScript + CSS Modules。

## セットアップ
```bash
npm install
npm run dev
# http://localhost:3000
```

## 構成
- `lib/steward.ts` — 状態機械の型・定数・整形関数
- `lib/useSteward.ts` — タイマー付きフック（localStorage 永続化 / 開発用倍速）
- `components/*` — StatusHeader / WakeTimer と 3 画面
- `app/*` — layout / page / globals

## 生活状態
`sleeping → waking → awake`。起床目標は 30 分。残り時間が 00:00 になっても自動遷移せず、
「起床完了」を押して初めて awake へ移る。