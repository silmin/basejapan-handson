import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import dotenv from "dotenv";

// 環境変数を読み込み
dotenv.config();

/**
 * 指定されたウォレットアドレスの残高を確認します
 */
async function checkWallet() {
  try {
    console.log("👛 ウォレット情報を確認中...");
    console.log("🌐 ネットワーク: Base Sepolia Testnet");

    // パブリッククライアントを作成（読み取り専用）
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.RPC_URL),
    });

    // 環境変数からウォレットアドレスを取得
    const walletAddress = process.env.WALLET_ADDRESS;

    if (!walletAddress) {
      throw new Error("WALLET_ADDRESSが.envファイルに設定されていません");
    }

    console.log(`📍 ウォレットアドレス: ${walletAddress}`);

    // ETH残高を取得
    const balance = await client.getBalance({
      address: walletAddress,
    });

    // WeiからETHに変換
    const balanceInEth = formatEther(balance);

    console.log(`💰 ETH残高: ${balanceInEth} ETH`);
    console.log(`💰 Wei残高: ${balance.toString()} Wei`);

    // 最新ブロック番号を取得
    const blockNumber = await client.getBlockNumber();
    console.log(`📦 最新ブロック番号: ${blockNumber}`);

    // チェーンIDを確認
    const chainId = await client.getChainId();
    console.log(`🔗 チェーンID: ${chainId}`);

    // 残高が少ない場合の警告
    if (parseFloat(balanceInEth) < 0.001) {
      console.log("\n⚠️  注意: ETH残高が少なすぎます！");
      console.log("📋 以下のFaucetからテスト用ETHを取得してください:");
      console.log(
        "🚰 Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet"
      );
    }

    // トランザクション履歴の一部を取得（最新5件）
    console.log("\n📜 最近のトランザクション履歴（最新5件）:");
    try {
      const latestBlock = await client.getBlock({
        blockNumber: blockNumber,
        includeTransactions: true,
      });

      const relevantTxs = latestBlock.transactions
        .filter(
          (tx) =>
            tx.from?.toLowerCase() === walletAddress.toLowerCase() ||
            tx.to?.toLowerCase() === walletAddress.toLowerCase()
        )
        .slice(0, 5);

      if (relevantTxs.length > 0) {
        relevantTxs.forEach((tx, index) => {
          console.log(`  ${index + 1}. Hash: ${tx.hash}`);
          console.log(`     From: ${tx.from}`);
          console.log(`     To: ${tx.to || "Contract Creation"}`);
          console.log(`     Value: ${formatEther(tx.value)} ETH`);
          console.log("");
        });
      } else {
        console.log(
          "  最新ブロックにはこのウォレットに関連するトランザクションがありません"
        );
      }
    } catch (error) {
      console.log("  トランザクション履歴の取得に失敗しました");
    }

    console.log("✅ ウォレット情報の確認が完了しました！");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error.message);

    if (error.message.includes("Invalid URL")) {
      console.log("💡 RPC_URLを確認してください");
    } else if (error.message.includes("WALLET_ADDRESS")) {
      console.log("💡 .envファイルにWALLET_ADDRESSを設定してください");
    }

    process.exit(1);
  }
}

// スクリプト実行
checkWallet();
