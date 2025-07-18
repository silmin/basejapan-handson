# Base Blockchain Smart Contract Workshop

このリポジトリは、Baseブロックチェーンを使用したスマートコントラクト開発の初歩を学ぶためのワークショップ用教材です。

## 📁 プロジェクト構成

```
base-workshop/
├── contracts/
│   ├── SimpleStorage.sol      # 簡単なスマートコントラクト
│   └── ERC20Token.sol         # ERC-20トークンコントラクト
├── scripts/
│   ├── check-wallet.js        # ウォレット残高確認
│   ├── compile-simplestorage.js # SimpleStorageコンパイル
│   ├── compile-erc20.js       # ERC-20コンパイル
│   ├── deploy-simplestorage.js # SimpleStorageデプロイ
│   ├── simplestorage-execute.js # SimpleStorage実行
│   ├── deploy-erc20.js        # ERC-20トークンデプロイ
│   ├── erc20-info.js          # ERC-20トークン情報表示
│   ├── erc20-balance.js       # ERC-20残高確認
│   ├── erc20-transfer.js      # ERC-20トークン転送
│   ├── erc20-approve.js       # ERC-20承認
│   ├── erc20-mint.js          # ERC-20ミント
│   └── erc20-burn.js          # ERC-20焼却
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

# コントラクトアドレス（デプロイ後に自動設定されます）
SIMPLESTORAGE_CONTRACT_ADDRESS=
ERC20_CONTRACT_ADDRESS=
```

**⚠️ 重要な注意事項：**
- 本番環境では絶対にプライベートキーをコードにハードコーディングしないでください
- テスト用のウォレットを使用してください
- `.env`ファイルは`.gitignore`に含まれているため、リポジトリにコミットされません

### 3. テストネット用ETHの取得

Base Sepoliaテストネットで動作確認するため、以下からテスト用ETHを取得してください：
- [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)

### 4. スマートコントラクトのコンパイル

```bash
npm run compile:simplestorage   # SimpleStorageの場合
npm run compile:erc20           # ERC20の場合
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
npm run deploy:simplestorage    # SimpleStorageの場合
npm run deploy:erc20            # ERC20の場合
```

`SimpleStorage`コントラクトをBase Sepoliaテストネットにデプロイします。

### 3. スマートコントラクトの実行

```bash
npm run exe:~~~
```

デプロイ済みのコントラクトと相互作用（数値の保存・取得）を行います。

## 📚 学習内容

### SimpleStorageコントラクトについて

このワークショップで使用する`SimpleStorage`コントラクトは以下の機能を持ちます：

- **store(uint256 _number)**: 数値を保存する関数
- **retrieve()**: 保存された数値を取得する関数

### ERC-20トークンについて

`ERC20Token`コントラクトは標準的なERC-20トークンの実装です：

#### 基本機能
- **name()**: トークン名を取得
- **symbol()**: トークンシンボルを取得
- **decimals()**: 小数点以下の桁数を取得
- **totalSupply()**: 総発行量を取得
- **balanceOf(address)**: 指定アドレスの残高を取得

#### 転送機能
- **transfer(address to, uint256 value)**: トークンを転送
- **approve(address spender, uint256 value)**: 転送の承認
- **transferFrom(address from, address to, uint256 value)**: 承認された転送
- **allowance(address owner, address spender)**: 承認額を確認

#### 追加機能
- **mint(address to, uint256 value)**: トークンを新規発行
- **burn(uint256 value)**: トークンを焼却

### viemライブラリについて

[viem](https://viem.sh/)は、Ethereumとやり取りするためのモダンなTypeScript/JavaScriptライブラリです：

- 型安全性に優れている
- 直感的なAPI
- 豊富なドキュメント
- アクティブなコミュニティ

## 🔧 NPMスクリプト

### 基本操作
- `npm run check-wallet`: ウォレット残高を確認
- `npm run compile:simplestorage`: SimpleStorageコントラクトをコンパイル
- `npm run compile:erc20`: ERC-20トークンコントラクトをコンパイル

### SimpleStorage
- `npm run deploy:simplestorage`: SimpleStorageコントラクトをデプロイ
- `npm run exe:simplestorage`: SimpleStorageコントラクトを実行

### ERC-20トークン
- `npm run deploy:erc20`: ERC-20トークンコントラクトをデプロイ
- `npm run exe:erc20-info`: ERC-20トークンの基本情報を表示
- `npm run exe:erc20-balance`: ERC-20トークンの残高を確認
- `npm run exe:erc20-transfer`: ERC-20トークンを転送
- `npm run exe:erc20-approve`: ERC-20トークンの使用を承認
- `npm run exe:erc20-mint`: ERC-20トークンを新規発行
- `npm run exe:erc20-burn`: ERC-20トークンを焼却

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
