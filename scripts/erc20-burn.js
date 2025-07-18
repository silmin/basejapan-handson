import { createPublicClient, createWalletClient, http, formatEther, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

/**
 * ERC20トークンを焼却（burn）します
 */
async function burnERC20() {
  try {
    console.log("🔥 ERC20トークンを焼却中...");
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

    // 焼却設定
    const burnAmount = parseEther("25"); // 25 tokens

    // トークンシンボルを取得
    const symbol = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "symbol",
    });

    // 焼却前の残高と総発行量を確認
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

    console.log(`📊 焼却前の残高: ${formatEther(balanceBefore)} ${symbol}`);
    console.log(`💎 焼却前の総発行量: ${formatEther(totalSupplyBefore)} ${symbol}`);

    if (balanceBefore < burnAmount) {
      throw new Error("残高不足です");
    }

    console.log(`🔥 ${formatEther(burnAmount)} ${symbol} を焼却中...`);

    // 焼却実行
    const burnHash = await walletClient.writeContract({
      address: contractAddress,
      abi,
      functionName: "burn",
      args: [burnAmount],
    });

    console.log(`📋 焼却トランザクション Hash: ${burnHash}`);
    console.log("⏳ トランザクションの確認を待っています...");

    const burnReceipt = await publicClient.waitForTransactionReceipt({
      hash: burnHash,
      confirmations: 1,
    });

    if (burnReceipt.status === "success") {
      console.log("✅ 焼却成功！");

      // 焼却後の残高と総発行量を確認
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

      console.log(`📊 焼却後の残高: ${formatEther(balanceAfter)} ${symbol}`);
      console.log(`💎 焼却後の総発行量: ${formatEther(totalSupplyAfter)} ${symbol}`);
      console.log(`🔍 Transaction: https://sepolia.basescan.org/tx/${burnHash}`);
    } else {
      console.error("❌ 焼却失敗");
    }

  } catch (error) {
    console.error("❌ エラー:", error.message);
    process.exit(1);
  }
}

burnERC20();