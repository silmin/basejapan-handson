import {
  createWalletClient,
  createPublicClient,
  http,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// 環境変数を読み込み
dotenv.config();

/**
 * SimpleStorageコントラクトをBase Sepoliaテストネットにデプロイします
 */
async function deployContract() {
  try {
    console.log("🚀 SimpleStorageコントラクトをデプロイ中...");
    console.log("🌐 ネットワーク: Base Sepolia Testnet");

    // 環境変数チェック
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEYが.envファイルに設定されていません");
    }

    if (!process.env.RPC_URL) {
      throw new Error("RPC_URLが.envファイルに設定されていません");
    }

    // コンパイル済みコントラクトを読み込み
    const compiledPath = path.join(
      process.cwd(),
      "compiled",
      "SimpleStorage.json"
    );
    if (!fs.existsSync(compiledPath)) {
      throw new Error(
        "コンパイル済みコントラクトが見つかりません。先に npm run compile を実行してください"
      );
    }

    const contractData = JSON.parse(fs.readFileSync(compiledPath, "utf8"));
    const { abi, bytecode } = contractData;

    // アカウントを作成
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    console.log(`👤 デプロイアカウント: ${account.address}`);

    // クライアントを作成
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.RPC_URL),
    });

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(process.env.RPC_URL),
    });

    // 残高チェック
    const balance = await publicClient.getBalance({
      address: account.address,
    });

    const balanceInEth = formatEther(balance);
    console.log(`💰 残高: ${balanceInEth} ETH`);

    if (parseFloat(balanceInEth) < 0.001) {
      console.warn(
        "⚠️  残高が少ない可能性があります。デプロイに失敗する場合はFaucetからETHを取得してください。"
      );
    }

    // ガス価格を取得
    const gasPrice = await publicClient.getGasPrice();
    console.log(
      `⛽ ガス価格: ${formatEther(gasPrice * BigInt(1000000))} ETH/1M gas`
    );

    // コントラクトをデプロイ
    console.log("📄 コントラクトをデプロイしています...");

    const hash = await walletClient.deployContract({
      abi,
      bytecode,
      args: [], // SimpleStorageコンストラクタには引数なし
    });

    console.log(`📋 デプロイトランザクション Hash: ${hash}`);
    console.log("⏳ トランザクションの確認を待っています...");

    // トランザクションレシートを取得
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

    if (receipt.status === "success") {
      console.log("✅ デプロイ成功！");
      console.log(`📍 コントラクトアドレス: ${receipt.contractAddress}`);
      console.log(`⛽ 使用ガス: ${receipt.gasUsed.toString()}`);
      console.log(
        `💰 トランザクション費用: ${formatEther(
          receipt.gasUsed * gasPrice
        )} ETH`
      );
      console.log(`📦 ブロック番号: ${receipt.blockNumber}`);

      // Base Sepolia Explorerのリンクを表示
      console.log(
        `🔍 Base Sepolia Explorer: https://sepolia.basescan.org/address/${receipt.contractAddress}`
      );

      // .envファイルにコントラクトアドレスを追加する提案
      console.log("\n💡 次のステップ:");
      console.log(`1. .envファイルに以下の行を追加してください:`);
      console.log(`   CONTRACT_ADDRESS=${receipt.contractAddress}`);
      console.log(
        "2. npm run execute でコントラクトとのやり取りを試してください"
      );

      // 自動で.envファイルを更新
      try {
        const envPath = path.join(process.cwd(), ".env");
        let envContent = fs.readFileSync(envPath, "utf8");

        if (envContent.includes("CONTRACT_ADDRESS=")) {
          // 既存のCONTRACT_ADDRESSを更新
          envContent = envContent.replace(
            /CONTRACT_ADDRESS=.*/,
            `CONTRACT_ADDRESS=${receipt.contractAddress}`
          );
        } else {
          // 新しくCONTRACT_ADDRESSを追加
          envContent += `\nCONTRACT_ADDRESS=${receipt.contractAddress}\n`;
        }

        fs.writeFileSync(envPath, envContent);
        console.log("✅ .envファイルにCONTRACT_ADDRESSを自動追加しました");
      } catch (error) {
        console.log(
          "⚠️  .envファイルの自動更新に失敗しました。手動で追加してください。"
        );
      }
    } else {
      console.error("❌ デプロイ失敗");
      console.error("レシート:", receipt);
    }
  } catch (error) {
    console.error("❌ デプロイエラー:", error.message);

    if (error.message.includes("insufficient funds")) {
      console.log("💡 残高不足です。Faucetからテスト用ETHを取得してください");
      console.log(
        "🚰 Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
      );
    } else if (error.message.includes("PRIVATE_KEY")) {
      console.log(
        "💡 .envファイルでPRIVATE_KEYが正しく設定されているか確認してください"
      );
    } else if (error.message.includes("RPC_URL")) {
      console.log(
        "💡 .envファイルでRPC_URLが正しく設定されているか確認してください"
      );
    }

    process.exit(1);
  }
}

// スクリプト実行
deployContract();
