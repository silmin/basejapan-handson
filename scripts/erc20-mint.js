import { createPublicClient, createWalletClient, http, formatEther, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

/**
 * ERC20トークンを新規発行（ミント）します
 */
async function mintERC20() {
  try {
    console.log("🪙 ERC20トークンをミント中...");
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
    console.log(`👤 実行者: ${account.address}`);

    // ミント設定
    const mintAmount = parseEther("100"); // 100 tokens

    // トークンシンボルを取得
    const symbol = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "symbol",
    });

    // ミント前の残高と総発行量を確認
    const balanceBefore = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "balanceOf",
      args: [account.address],
    });

    const totalSupplyBefore = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "totalSupply",
    });

    console.log(`📊 ミント前の残高: ${formatEther(balanceBefore)} ${symbol}`);
    console.log(`💎 ミント前の総発行量: ${formatEther(totalSupplyBefore)} ${symbol}`);

    console.log(`➕ ${formatEther(mintAmount)} ${symbol} をミント中...`);

    // ミント実行
    const mintHash = await walletClient.writeContract({
      address: contractAddress,
      abi,
      functionName: "mint",
      args: [account.address, mintAmount],
    });

    console.log(`📋 ミントトランザクション Hash: ${mintHash}`);
    console.log("⏳ トランザクションの確認を待っています...");

    const mintReceipt = await publicClient.waitForTransactionReceipt({
      hash: mintHash,
      confirmations: 1,
    });

    if (mintReceipt.status === "success") {
      console.log("✅ ミント成功！");

      // ミント後の残高と総発行量を確認
      const balanceAfter = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "balanceOf",
        args: [account.address],
      });

      const totalSupplyAfter = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "totalSupply",
      });

      console.log(`📊 ミント後の残高: ${formatEther(balanceAfter)} ${symbol}`);
      console.log(`💎 ミント後の総発行量: ${formatEther(totalSupplyAfter)} ${symbol}`);
      console.log(`🔍 Transaction: https://sepolia.basescan.org/tx/${mintHash}`);
    } else {
      console.error("❌ ミント失敗");
    }

  } catch (error) {
    console.error("❌ エラー:", error.message);
    process.exit(1);
  }
}

mintERC20();