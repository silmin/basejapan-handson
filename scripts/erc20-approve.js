import { createPublicClient, createWalletClient, http, formatEther, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

/**
 * ERC20トークンの使用を承認します
 */
async function approveERC20() {
  try {
    console.log("🤝 ERC20トークンの使用を承認中...");
    console.log("🌐 ネットワーク: Base Sepolia Testnet");

    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEYが.envファイルに設定されていません");
    }

    if (!process.env.RPC_URL) {
      throw new Error("RPC_URLが.envファイルに設定されていません");
    }

    if (!process.env.ERC20_CONTRACT_ADDRESS) {
      throw new Error(
        "ERC20_CONTRACT_ADDRESSが.envファイルに設定されていません。先にnpm run deploy-erc20を実行してください"
      );
    }

    const compiledPath = path.join(process.cwd(), "compiled", "ERC20Token.json");
    if (!fs.existsSync(compiledPath)) {
      throw new Error("コンパイル済みコントラクトが見つかりません。先に npm run compile を実行してください");
    }

    const contractData = JSON.parse(fs.readFileSync(compiledPath, "utf8"));
    const { abi } = contractData;

    const account = privateKeyToAccount(process.env.PRIVATE_KEY);
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.RPC_URL),
    });

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(process.env.RPC_URL),
    });

    const contractAddress = process.env.ERC20_CONTRACT_ADDRESS;
    console.log(`📍 コントラクトアドレス: ${contractAddress}`);
    console.log(`👤 承認者: ${account.address}`);

    // 承認設定（テスト用）
    const spender = "0x000000000000000000000000000000000000dEaD"; // Dead address（テスト用）
    const approveAmount = parseEther("50"); // 50 tokens

    // トークンシンボルを取得
    const symbol = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "symbol",
    });

    console.log(`📝 ${formatEther(approveAmount)} ${symbol} の使用を ${spender} に承認中...`);

    // 承認実行
    const approveHash = await walletClient.writeContract({
      address: contractAddress,
      abi,
      functionName: "approve",
      args: [spender, approveAmount],
    });

    console.log(`📋 承認トランザクション Hash: ${approveHash}`);
    console.log("⏳ トランザクションの確認を待っています...");

    const approveReceipt = await publicClient.waitForTransactionReceipt({
      hash: approveHash,
      confirmations: 1,
    });

    if (approveReceipt.status === "success") {
      console.log("✅ 承認成功！");

      // 承認額を確認
      const allowanceAmount = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "allowance",
        args: [account.address, spender],
      });

      console.log(`📊 承認額: ${formatEther(allowanceAmount)} ${symbol}`);
      console.log(`🔍 Transaction: https://sepolia.basescan.org/tx/${approveHash}`);
    } else {
      console.error("❌ 承認失敗");
    }

  } catch (error) {
    console.error("❌ エラー:", error.message);
    process.exit(1);
  }
}

approveERC20();