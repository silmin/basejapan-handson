import {
  createPublicClient,
  createWalletClient,
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
 * SimpleStorageコントラクトとのやり取りを実行します
 */
async function executeContract() {
  try {
    console.log("🎯 SimpleStorageコントラクトとのやり取りを開始...");
    console.log("🌐 ネットワーク: Base Sepolia Testnet");

    // 環境変数チェック
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEYが.envファイルに設定されていません");
    }

    if (!process.env.RPC_URL) {
      throw new Error("RPC_URLが.envファイルに設定されていません");
    }

    if (!process.env.SIMPLESTORAGE_CONTRACT_ADDRESS) {
      throw new Error(
        "SIMPLESTORAGE_CONTRACT_ADDRESSが.envファイルに設定されていません。先にnpm run deploy:simplestorageを実行してください"
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
        "コンパイル済みコントラクトが見つかりません。先に npm run compile:simplestorage を実行してください"
      );
    }

    const contractData = JSON.parse(fs.readFileSync(compiledPath, "utf8"));
    const { abi } = contractData;

    // アカウントを作成
    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    console.log(`👤 実行アカウント: ${account.address}`);

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

    const contractAddress = process.env.SIMPLESTORAGE_CONTRACT_ADDRESS;
    console.log(`📍 コントラクトアドレス: ${contractAddress}`);

    // 1. 現在の値を取得
    console.log("\n📊 現在の値を取得中...");
    const currentValue = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "retrieveView",
    });
    console.log(`現在の値: ${currentValue}`);

    // 2. 新しい値を保存
    const newValue = BigInt(Math.floor(Math.random() * 1000) + 1);
    console.log(`\n📝 新しい値 ${newValue} を保存中...`);

    const storeHash = await walletClient.writeContract({
      address: contractAddress,
      abi,
      functionName: "store",
      args: [newValue],
    });

    console.log(`📋 保存トランザクション Hash: ${storeHash}`);
    console.log("⏳ トランザクションの確認を待っています...");

    // トランザクションレシートを取得
    const storeReceipt = await publicClient.waitForTransactionReceipt({
      hash: storeHash,
      confirmations: 1,
    });

    if (storeReceipt.status === "success") {
      console.log("✅ 保存成功！");
      console.log(`⛽ 使用ガス: ${storeReceipt.gasUsed.toString()}`);

      // 3. 更新された値を取得
      console.log("\n📊 更新された値を取得中...");
      const updatedValue = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "retrieveView",
      });
      console.log(`更新後の値: ${updatedValue}`);

      // 4. retrieve関数を実行
      console.log("🎉 retrieve関数を実行...");
      const retrieveHash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: "retrieve",
      });

      console.log(`📋 取得トランザクション Hash: ${retrieveHash}`);
      console.log("⏳ トランザクションの確認を待っています...");

      const retrieveReceipt = await publicClient.waitForTransactionReceipt({
        hash: retrieveHash,
        confirmations: 1,
      });

      if (retrieveReceipt.status === "success") {
        console.log("✅ 取得成功！");
        console.log(`⛽ 使用ガス: ${retrieveReceipt.gasUsed.toString()}`);
      }

      // 5. add関数で値を加算
      const addValue = BigInt(50);
      console.log(`\n➕ 現在の値に ${addValue} を加算中...`);

      const addHash = await walletClient.writeContract({
        address: contractAddress,
        abi,
        functionName: "add",
        args: [addValue],
      });

      console.log(`📋 加算トランザクション Hash: ${addHash}`);
      console.log("⏳ トランザクションの確認を待っています...");

      const addReceipt = await publicClient.waitForTransactionReceipt({
        hash: addHash,
        confirmations: 1,
      });

      if (addReceipt.status === "success") {
        console.log("✅ 加算成功！");

        // 最終的な値を取得
        const finalValue = await publicClient.readContract({
          address: contractAddress,
          abi,
          functionName: "retrieveView",
        });
        console.log(`最終的な値: ${finalValue}`);
      }

      console.log("\n🎉 SimpleStorageコントラクトとのやり取りが完了しました！");
      console.log(
        `🔍 Base Sepolia Explorer: https://sepolia.basescan.org/address/${contractAddress}`
      );
    } else {
      console.error("❌ 保存失敗");
      console.error("レシート:", storeReceipt);
    }
  } catch (error) {
    console.error("❌ 実行エラー:", error.message);

    if (error.message.includes("SIMPLESTORAGE_CONTRACT_ADDRESS")) {
      console.log(
        "💡 先にnpm run deploy:simplestorageでSimpleStorageコントラクトをデプロイしてください"
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
executeContract();
