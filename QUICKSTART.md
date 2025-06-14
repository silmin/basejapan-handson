# 🚀 クイックスタートガイド

このガイドを使って、15分でBaseブロックチェーン上でスマートコントラクトを動かしてみましょう！

## ⏰ 所要時間: 約15分

## 📋 事前準備

1. **Node.js** (v18以上) がインストールされていること
2. **テスト用ウォレット** を準備（MetaMaskなど）
3. **Base Sepolia testnet**に接続設定済み

## 🏃‍♂️ 5分で動かす手順

### Step 1: セットアップ (2分)

```bash
# 依存関係をインストール
npm install

# 環境変数ファイルを作成
cp .env.example .env
```

### Step 2: 環境変数を設定 (3分)

`.env`ファイルを編集してください：

```bash
# あなたのテスト用ウォレットの情報に置き換えてください
PRIVATE_KEY=0x[あなたのプライベートキー]
WALLET_ADDRESS=0x[あなたのウォレットアドレス]
RPC_URL=https://sepolia.base.org
```

**⚠️ 重要:** 必ずテスト用のウォレットを使用してください！

### Step 3: テスト用ETHを取得 (2分)

[Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)からテスト用ETHを取得

### Step 4: 実行！ (8分)

```bash
# 1. ウォレット残高を確認
npm run check-wallet

# 2. コントラクトをコンパイル
npm run compile

# 3. コントラクトをデプロイ
npm run deploy

# 4. コントラクトを実行
npm run execute
```

## 🎯 各ステップで何が起こるか

### `npm run check-wallet`
- ウォレットの残高確認
- ネットワーク接続テスト
- 最新のトランザクション履歴表示

### `npm run compile`
- SolidityコードをJavaScriptで使える形にコンパイル
- ABI（Application Binary Interface）を生成
- バイトコードを生成

### `npm run deploy`
- Base Sepoliaネットワークにコントラクトをデプロイ
- コントラクトアドレスを取得
- Explorer URLを表示

### `npm run execute`
- 数値の保存と取得
- 加算機能のテスト
- イベントの発火確認
- (所有者の場合) リセット機能のテスト

## 💡 ワークショップでの学習ポイント

### 1. **ブロックチェーンの基本概念**
- ウォレット、アドレス、プライベートキー
- トランザクション、ガス、確認

### 2. **スマートコントラクトの構造**
- 状態変数 (`storedNumber`)
- 関数 (`store`, `retrieve`, `add`)
- イベント (`NumberStored`, `NumberRetrieved`)
- アクセス制御 (`owner`, `reset`)

### 3. **Web3開発の流れ**
- コンパイル → デプロイ → 実行
- ABI（コントラクトとのインターフェース）
- トランザクションとビュー関数の違い

### 4. **viemライブラリの使い方**
- クライアントの作成 (`createPublicClient`, `createWalletClient`)
- コントラクトの読み取り (`readContract`)
- コントラクトの書き込み (`writeContract`)
- トランザクションの待機 (`waitForTransactionReceipt`)

## 🔧 トラブルシューティング

### ❌ よくあるエラー

**`insufficient funds for gas`**
→ テスト用ETHが不足しています。Faucetから取得してください。

**`execution reverted`**
→ コントラクトの実行が失敗しました。デプロイアドレスを確認してください。

**`invalid private key`**
→ プライベートキーの形式を確認してください（0xで始まる必要があります）。

### 🆘 助けが必要な場合

1. エラーメッセージを確認
2. Base Sepolia Explorer でトランザクションを確認
3. 残高とガス価格を確認
4. 環境変数の設定を再確認

## 🎓 次のステップ

このワークショップが完了したら：

1. **コントラクトを改造してみる**
   - 新しい関数を追加
   - 複数の値を保存できるように拡張

2. **フロントエンドを作ってみる**
   - React + viemでWebアプリケーション作成

3. **他のチェーンにデプロイ**
   - Ethereum mainnet（本番環境）
   - 他のL2チェーン

4. **より複雑なコントラクト**
   - ERC-20トークン
   - NFT (ERC-721)
   - DeFiプロトコル

## 📚 参考資料

- [Base公式ドキュメント](https://docs.base.org/)
- [viem公式ドキュメント](https://viem.sh/)
- [Solidity公式ドキュメント](https://docs.soliditylang.org/)
- [Base Sepolia Explorer](https://sepolia.basescan.org/)

---

🎉 **Happy Coding!** Baseブロックチェーンでのスマートコントラクト開発を楽しんでください！
