"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Temporal } from "@js-temporal/polyfill";
import {
  completeWaking as completeWakingState,
  INITIAL_STEWARD_STATE,
  resetToSleeping as resetStateToSleeping,
  STEWARD_STORAGE_KEY,
  startWaking as startWakingState,
  type StewardState,
} from "./steward";
import { loadStewardState, saveStewardState } from "./stewardStorage";

type StewardSnapshot = {
  state: StewardState;
  isLoaded: boolean;
};

// useSyncExternalStore は SSR 用のスナップショットを要求する。
// サーバーでは localStorage を読めないため、永続化済みの実状態を推測せず、
// 初期状態かつ未ロードとして固定値を返し、クライアントで初めて状態を読む時に実状態へ切り替える。
const SERVER_SNAPSHOT: StewardSnapshot = {
  state: INITIAL_STEWARD_STATE,
  isLoaded: false,
};

// Steward の React 側ストアはモジュール内に 1 つだけ持つ。
// 複数コンポーネントが useSteward を呼んでも同じ snapshot を共有し、
// どこか 1 箇所の更新を登録済みの listener 全体へ通知できるようにする。
let clientSnapshot: StewardSnapshot | null = null;
const listeners = new Set<() => void>();

// クライアント snapshot は初回参照時にだけ localStorage から復元する。
// import 時点ではブラウザ API に触れず、React がクライアントで状態を読み始めるタイミングまで
// 永続化データの読み込みを遅延させることで、SSR/CSR の境界をこの関数に閉じ込める。
function getClientSnapshot(): StewardSnapshot {
  if (clientSnapshot === null) {
    clientSnapshot = {
      state: loadStewardState(),
      isLoaded: true,
    };
  }

  return clientSnapshot;
}

function getServerSnapshot(): StewardSnapshot {
  return SERVER_SNAPSHOT;
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

// Steward の状態変更はこの関数に集約する。
// ドメイン層の純粋関数に現在の state を渡し、返ってきた state だけを snapshot として採用する。
// 同じ参照が返った場合は「遷移条件を満たさず状態が変わらなかった」とみなし、
// localStorage 書き込みと React への通知を省いて不要な再レンダリングを避ける。
// 変更がある場合は、メモリ上の snapshot と localStorage を同じ順番で更新してから listener へ通知する。
function updateSnapshot(updateState: (state: StewardState) => StewardState): void {
  const currentSnapshot = getClientSnapshot();
  const nextState = updateState(currentSnapshot.state);

  if (nextState === currentSnapshot.state) {
    return;
  }

  clientSnapshot = {
    state: nextState,
    isLoaded: true,
  };

  saveStewardState(nextState);
  notifyListeners();
}

// useSyncExternalStore に渡す subscribe 関数。
// React から渡された listener を内部 Set に保持し、updateSnapshot から明示的に呼び出す。
// さらに storage イベントも監視して、別タブや別ウィンドウで保存値が変わった場合に
// localStorage の最新値を snapshot へ取り込み、このタブの UI も同じ状態へ追従させる。
// event.key が null のケースは clear() など広範囲な storage 変更なので、Steward の再読込対象にする。
function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  function handleStorage(event: StorageEvent): void {
    if (event.key !== STEWARD_STORAGE_KEY && event.key !== null) {
      return;
    }

    clientSnapshot = {
      state: loadStewardState(),
      isLoaded: true,
    };
    notifyListeners();
  }

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(listener);
    };
  }

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useSteward() {
  // useSyncExternalStore で React の concurrent rendering と SSR に対応した外部ストアとして扱う。
  // クライアントでは getClientSnapshot、サーバーでは getServerSnapshot を使い分けることで、
  // localStorage 依存の状態を通常の React state と同じ感覚で読むための境界を作る。
  const snapshot = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const { state, isLoaded } = snapshot;

  // 開発・検証用にどの状態からでも sleeping へ戻す操作。
  // 実際の state 構築は steward.ts 側へ委譲し、この hook は永続化と通知だけを担当する。
  const resetToSleeping = useCallback(() => {
    updateSnapshot(() => resetStateToSleeping());
  }, []);

  // 起床開始は現在時刻を境界で確定してからドメイン関数へ渡す。
  // sleeping 以外では steward.ts 側が同じ state 参照を返すため、ここでは分岐を重複させない。
  const startWaking = useCallback(() => {
    updateSnapshot((currentState) =>
      startWakingState(currentState, Temporal.Now.instant()),
    );
  }, []);

  // 起床完了も開始時と同様に現在時刻だけを hook 側で注入する。
  // waking 以外、または開始時刻が欠けている状態ではドメイン関数が no-op にする。
  const completeWaking = useCallback(() => {
    updateSnapshot((currentState) =>
      completeWakingState(currentState, Temporal.Now.instant()),
    );
  }, []);

  // 利用側が state 全体にも個別フィールドにもアクセスできる形で返す。
  // state は詳細な派生処理向け、lifeState などの個別値は表示コンポーネントの依存を明示しやすくするために公開する。
  // isLoaded は SSR 初期値と localStorage 復元後の値を区別したい UI で使用する。
  return {
    state,
    lifeState: state.lifeState,
    wakeStartedAt: state.wakeStartedAt,
    wakeCompletedAt: state.wakeCompletedAt,
    isLoaded,
    resetToSleeping,
    startWaking,
    completeWaking,
  };
}

export type Steward = ReturnType<typeof useSteward>;
