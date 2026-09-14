# v0.5.0 検証報告

実施日: 2026年9月13日。集計生成時刻UTC: 2026-09-13T13:40:23.229464+00:00。
対象: ユーザー提供v0.4.1から改修した `dist/NEMESIS-PACT.html`。
SHA-256: `761cd6340eef02fedec94cbeb84fd8d528b8781238d14f85c0f7dc9285c6ba76`。
単体HTML: 323,999 bytes。

## 実施結果

| 項目 | 結果 | 証拠 |
|---|---|---|
| 元のv0.4.1 Nodeテスト | 124 / 124成功 | 作業時のbaseline-tests.log。元ZIPは変更していない |
| 現v0.5.0 Nodeテスト | **164 / 164成功、失敗0**。新規40件 | validation-0.5.0/unit-tests.txt |
| 構文検査 | 成功 | validation-0.5.0/syntax-checks.txt |
| 新契約UI・署名・再交渉 | 1280×800、390×844、320×568の3サイズ、18検査グループ成功 | covenant-browser-results.json |
| 旧キャンペーンUI・描画 | 3サイズ × 6セクター = **18描画フィクスチャ**、ページ例外0、外部リクエスト0 | legacy-browser/browser-results.json |
| 新モード通しシミュレーション | desktop/portrait × standard/veteran × 3初期契約 = **12 / 12勝利** | covenant-simulations.json |
| 旧キャンペーン通しシミュレーション | desktop/portrait × Expedition/Gauntlet × 3難易度 = **12 / 12勝利** | campaign-simulations.json |
| 新モードの実ブラウザ通し確認 | desktop/portraitの合法入力パイロットで勝利→結果画面→Retry成功 | covenant-playthrough-browser.json |
| Loopback HTTP | **9検査成功**。Hostedの配信、秘密ファイル非配信、2 API経路、形式・権限制御の一部 | server-smoke.json |
| Web Audio / 音声UI | **88検査成功、17キューを実サンプル描画** | audio-results.json / audio-render-results.json / audio-wav/ |

新モードのシミュレーション時間は 34.46～52.28 秒でした。これは全状態を観察する自動パイロットの戦闘内時間であり、交渉中の壁時計時間を含む一般プレイヤーの所要時間ではありません。難易度・面白さ・反射神経の人間評価の代用ではありません。

## 何を確認したか

新規単体テストは、ちょうど36種類の有効な機械ルール、予算違反／未知フィールド／非有限値の拒否、提案の非破壊性、署名revision、移動した結界の実弾消去、レーザーを防がないこと、弾速・反射・代償、18秒の時間停止、1回の契約置換、旧弾の速度変更、破棄、記憶の上限、計測値、決定性を確認します。クライアントの同意・Hosted制約、遅延返信・キャンセル・競合、ローカルフォールバックもテストしました。

サーバーのlive経路は、固定upstream・構造化出力・入力制限・Origin/トークン・上限・エラー時フォールバックを**注入したテスト応答**で検査しました。テストで `provider: openai` を返す場面もfixtureです。実OpenAI推論を行ったという意味ではありません。

旧18セクター描画は状態を設定したフィクスチャであり、18回の人間によるクリアではありません。一方、新旧各12通りの通しシミュレーションと新モードのブラウザ通し確認は、移動・射撃・パリィ・ダッシュ・Nova・契約署名等の合法入力のみです。ボスHPや体力や進行を改ざんして勝利させていません。単体テストには特定条件を作るための状態設定がありますが、通しシミュレーションの主張と区別しています。

## 検証環境と未検証事項

Node.js v22.16.0、Chromium 144.0.7559.96、Linux、WebGL2 / ANGLE / SwiftShaderのソフトウェア描画。画面画像は実ブラウザの描画であり、ImageGen画像ではありません。ハードウェアGPUのFPS、入力遅延、WebGPU実機動作、Safari、Windowsでの実行、実スマートフォン、人間による聴感・ゲームバランス評価は検証していません。

**実OpenAI推論0回。GPT-Live-1未統合。公開デプロイなし。1分動画の公開URLなし。応募フォーム未送信。**

`store:false` やローカルの利用上限は、あらゆるログ保持の無効化や総課金上限の保証ではありません。現在のアダプターは認証された限定パイロット向けで、永続クォータ等のない公開サービスとしての完成を意味しません。

## 再実行

```sh
npm run build
npm run check
npm test
npm run test:server
npm run test:campaign
npm run test:covenant-simulation
xvfb-run -a python3 tests/covenant_browser_test.py
xvfb-run -a python3 tests/expansion_browser_test.py
xvfb-run -a python3 tests/audio_browser_test.py
xvfb-run -a python3 tests/covenant_capture.py
```

ブラウザ系には別途Python Playwright、Chromium、Xvfb、一部検証にはPillow/NumPyが必要です。ゲーム本体にそれらを組み込んでいません。古い `validation-0.4.1/` は歴史的な証拠として保持し、現版の検証結果と混同しないようにしています。
