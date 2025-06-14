# Base Blockchain Smart Contract Workshop

このリポジトリは、Baseブロックチェーンを使用したスマートコントラクト開発の初歩を学ぶためのワークショップ用教材です。

## 📁 プロジェクト構成

```
base-workshop/
├── contracts/
│   └── SimpleStorage.sol      # 簡単なスマートコントラクト
├── scripts/
│   ├── check-wallet.js        # ウォレット残高確認
│   ├── execute-contract.js    # コントラクト実行
│   └── deploy-contract.js     # コントラクトデプロイ
├── compiled/                  # コンパイル済みコントラクト
├── .env.example              # 環境変数テンプレート
├── package.json
└── README.md
```

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして設定してください：

```bash
cp .env.example .env
```

`.env`ファイルを編集：
```
# あなたのプライベートキー（テスト用ウォレットを使用してください）
PRIVATE_KEY=your_private_key_here

# Base Sepolia Testnet RPC URL（無料で使用可能）
RPC_URL=https://sepolia.base.org

# ウォレットアドレス
WALLET_ADDRESS=your_wallet_address_here
```

**⚠️ 重要な注意事項：**
- 本番環境では絶対にプライベートキーをコードにハードコーディングしないでください
- テスト用のウォレットを使用してください
- `.env`ファイルは`.gitignore`に含まれているため、リポジトリにコミットされません

### 3. テストネット用ETHの取得

Base Sepoliaテストネットで動作確認するため、以下からテスト用ETHを取得してください：
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)

### 4. スマートコントラクトのコンパイル

```bash
npm run compile
```

このコマンドでSolidityコントラクトがコンパイルされ、`compiled/`ディレクトリにABIとバイトコードが生成されます。

## 🛠️ 使用方法

### 1. ウォレット残高の確認

```bash
npm run check-wallet
```

指定したウォレットアドレスのETH残高を確認します。

### 2. スマートコントラクトのデプロイ

```bash
npm run deploy
```

`SimpleStorage`コントラクトをBase Sepoliaテストネットにデプロイします。

### 3. スマートコントラクトの実行

```bash
npm run execute
```

デプロイ済みのコントラクトと相互作用（数値の保存・取得）を行います。

## 📚 学習内容

### SimpleStorageコントラクトについて

このワークショップで使用する`SimpleStorage`コントラクトは以下の機能を持ちます：

- **store(uint256 _number)**: 数値を保存する関数
- **retrieve()**: 保存された数値を取得する関数

### viemライブラリについて

[viem](https://viem.sh/)は、Ethereumとやり取りするためのモダンなTypeScript/JavaScriptライブラリです：

- 型安全性に優れている
- 直感的なAPI
- 豊富なドキュメント
- アクティブなコミュニティ

## 🔧 NPMスクリプト

- `npm run compile`: Solidityコントラクトをコンパイル
- `npm run check-wallet`: ウォレット残高を確認
- `npm run deploy`: コントラクトをデプロイ
- `npm run execute`: コントラクトを実行

## 📖 参考リンク

- [Base公式ドキュメント](https://docs.base.org/)
- [viem公式ドキュメント](https://viem.sh/)
- [Solidity公式ドキュメント](https://docs.soliditylang.org/)
- [Base Sepolia Block Explorer](https://sepolia.basescan.org/)

## ⚠️ トラブルシューティング

### よくある問題

1. **ガス不足エラー**
   - テストネット用ETHが不足している可能性があります
   - Faucetから追加のETHを取得してください

2. **RPC接続エラー**
   - インターネット接続を確認してください
   - RPC_URLが正しく設定されていることを確認してください

3. **プライベートキーエラー**
   - プライベートキーが正しく設定されていることを確認してください
   - `0x`プレフィックスが含まれていることを確認してください

## 🤝 貢献

バグ報告や改善提案はIssueまたはPull Requestでお願いします。

## 📄 ライセンス

MIT License
