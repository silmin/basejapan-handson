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
 * デプロイ済みのSimpleStorageコントラクトとやり取りします
 */
async function executeContract() {
  try {
    console.log("🔄 SimpleStorageコントラクトを実行中...");
    console.log("🌐 ネットワーク: Base Sepolia Testnet");

    // 環境変数チェック
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEYが.envファイルに設定されていません");
    }

    if (!process.env.CONTRACT_ADDRESS) {
      throw new Error(
        "CONTRACT_ADDRESSが.envファイルに設定されていません。先にコントラクトをデプロイしてください"
      );
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
    const { abi } = contractData;

    // アカウント作成
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    const contractAddress = process.env.CONTRACT_ADDRESS;

    console.log(`👤 実行アカウント: ${account.address}`);
    console.log(`📍 コントラクトアドレス: ${contractAddress}`);

    // クライアント作成
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
    console.log(`💰 残高: ${formatEther(balance)} ETH`);

    // 1. 現在保存されている値を確認
    console.log("\n📖 1. 現在保存されている値を確認...");
    const currentValue = await publicClient.readContract({
      address: contractAddress,
      abi: abi,
      functionName: "retrieveView",
    });
    console.log(`📊 現在の値: ${currentValue}`);

    // 2. コントラクトの所有者を確認
    console.log("\n👑 2. コントラクトの所有者を確認...");
    const owner = await publicClient.readContract({
      address: contractAddress,
      abi: abi,
      functionName: "getOwner",
    });
    console.log(`👤 所有者: ${owner}`);
    console.log(
      `🔍 あなたが所有者: ${
        owner.toLowerCase() === account.address.toLowerCase()
          ? "はい"
          : "いいえ"
      }`
    );

    // 3. 新しい値を保存
    const newValue = Math.floor(Math.random() * 1000) + 1; // 1-1000のランダムな数
    console.log(`\n💾 3. 新しい値を保存: ${newValue}`);

    const storeHash = await walletClient.writeContract({
      address: contractAddress,
      abi: abi,
      functionName: "store",
      args: [BigInt(newValue)],
    });

    console.log(`📋 トランザクション Hash: ${storeHash}`);
    console.log("⏳ トランザクションの確認を待っています...");

    const storeReceipt = await publicClient.waitForTransactionReceipt({
      hash: storeHash,
    });

    if (storeReceipt.status === "success") {
      console.log("✅ 値の保存に成功しました！");
      console.log(`⛽ 使用ガス: ${storeReceipt.gasUsed.toString()}`);

      // イベントログを確認
      const logs = storeReceipt.logs;
      if (logs.length > 0) {
        console.log("📜 イベントログ:");
        logs.forEach((log, index) => {
          console.log(`  ${index + 1}. Topics: ${log.topics.join(", ")}`);
        });
      }
    } else {
      console.log("❌ 値の保存に失敗しました");
    }

    // 4. 保存された値を再度確認
    console.log("\n📖 4. 保存された値を再度確認...");
    const updatedValue = await publicClient.readContract({
      address: contractAddress,
      abi: abi,
      functionName: "retrieveView",
    });
    console.log(`📊 更新後の値: ${updatedValue}`);

    // 5. 値に加算してみる
    const addValue = 50;
    console.log(`\n➕ 5. 値に ${addValue} を加算...`);

    const addHash = await walletClient.writeContract({
      address: contractAddress,
      abi: abi,
      functionName: "add",
      args: [BigInt(addValue)],
    });

    console.log(`📋 加算トランザクション Hash: ${addHash}`);
    console.log("⏳ トランザクションの確認を待っています...");

    const addReceipt = await publicClient.waitForTransactionReceipt({
      hash: addHash,
    });

    if (addReceipt.status === "success") {
      console.log("✅ 加算に成功しました！");
      console.log(`⛽ 使用ガス: ${addReceipt.gasUsed.toString()}`);
    }

    // 6. 最終的な値を確認
    console.log("\n📖 6. 最終的な値を確認...");
    const finalValue = await publicClient.readContract({
      address: contractAddress,
      abi: abi,
      functionName: "retrieveView",
    });
    console.log(`📊 最終的な値: ${finalValue}`);

    // 7. retrieve関数を呼び出してイベントを発火
    console.log("\n🔥 7. retrieveイベントを発火...");
    const retrieveHash = await walletClient.writeContract({
      address: contractAddress,
      abi: abi,
      functionName: "retrieve",
    });

    console.log(`📋 retrieveトランザクション Hash: ${retrieveHash}`);
    const retrieveReceipt = await publicClient.waitForTransactionReceipt({
      hash: retrieveHash,
    });

    if (retrieveReceipt.status === "success") {
      console.log("✅ retrieveイベントの発火に成功しました！");
      console.log(`⛽ 使用ガス: ${retrieveReceipt.gasUsed.toString()}`);
    }

    // 8. 所有者の場合はリセット機能をテスト
    if (owner.toLowerCase() === account.address.toLowerCase()) {
      console.log("\n🔄 8. リセット機能をテスト（所有者のみ）...");

      const resetHash = await walletClient.writeContract({
        address: contractAddress,
        abi: abi,
        functionName: "reset",
      });

      console.log(`📋 リセットトランザクション Hash: ${resetHash}`);
      const resetReceipt = await publicClient.waitForTransactionReceipt({
        hash: resetHash,
      });

      if (resetReceipt.status === "success") {
        console.log("✅ リセットに成功しました！");

        // リセット後の値を確認
        const resetValue = await publicClient.readContract({
          address: contractAddress,
          abi: abi,
          functionName: "retrieveView",
        });
        console.log(`📊 リセット後の値: ${resetValue}`);
      }
    } else {
      console.log(
        "\n⚠️  あなたは所有者ではないため、リセット機能はテストできません"
      );
    }

    // 実行結果サマリー
    console.log("\n🎉 実行完了！");
    console.log("📋 実行サマリー:");
    console.log(`  - 初期値: ${currentValue}`);
    console.log(`  - 保存した値: ${newValue}`);
    console.log(`  - 加算した値: ${addValue}`);
    console.log(`  - 最終値: ${finalValue}`);
    console.log(
      `  - 総ガス使用量: ${(
        storeReceipt.gasUsed +
        addReceipt.gasUsed +
        retrieveReceipt.gasUsed
      ).toString()}`
    );

    // Base Sepolia Explorerリンク
    console.log("\n🔍 トランザクション詳細:");
    console.log(`  Store: https://sepolia.basescan.org/tx/${storeHash}`);
    console.log(`  Add: https://sepolia.basescan.org/tx/${addHash}`);
    console.log(`  Retrieve: https://sepolia.basescan.org/tx/${retrieveHash}`);
  } catch (error) {
    console.error("❌ 実行エラー:", error.message);

    if (error.message.includes("CONTRACT_ADDRESS")) {
      console.log(
        "💡 先に npm run deploy でコントラクトをデプロイしてください"
      );
    } else if (error.message.includes("insufficient funds")) {
      console.log("💡 残高不足です。Faucetからテスト用ETHを取得してください");
    } else if (error.message.includes("execution reverted")) {
      console.log(
        "💡 コントラクトの実行が失敗しました。アドレスとABIを確認してください"
      );
    }

    process.exit(1);
  }
}

// スクリプト実行
executeContract();
