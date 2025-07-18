import { createPublicClient, createWalletClient, http, formatEther, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

/**
 * ERC20トークンを転送します
 */
async function transferERC20() {
  try {
    console.log("🔄 ERC20トークンを転送中...");
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
    console.log(`👤 送金者: ${account.address}`);

    // 転送設定（テスト用）
    const recipient = "0x000000000000000000000000000000000000dEaD"; // Dead address（テスト用）
    const transferAmount = parseEther("10"); // 10 tokens

    // トークンシンボルを取得
    const symbol = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "symbol",
    });

    // 転送前の残高を確認
    const balanceBefore = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "balanceOf",
      args: [account.address],
    });

    console.log(`📊 転送前の残高: ${formatEther(balanceBefore)} ${symbol}`);

    if (balanceBefore < transferAmount) {
      throw new Error("残高不足です");
    }

    console.log(`📤 ${formatEther(transferAmount)} ${symbol} を ${recipient} に転送中...`);

    // 転送実行
    const transferHash = await walletClient.writeContract({
      address: contractAddress,
      abi,
      functionName: "transfer",
      args: [recipient, transferAmount],
    });

    console.log(`📋 転送トランザクション Hash: ${transferHash}`);
    console.log("⏳ トランザクションの確認を待っています...");

    const transferReceipt = await publicClient.waitForTransactionReceipt({
      hash: transferHash,
      confirmations: 1,
    });

    if (transferReceipt.status === "success") {
      console.log("✅ 転送成功！");

      // 転送後の残高を確認
      const balanceAfter = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: "balanceOf",
        args: [account.address],
      });

      console.log(`📊 転送後の残高: ${formatEther(balanceAfter)} ${symbol}`);
      console.log(`🔍 Transaction: https://sepolia.basescan.org/tx/${transferHash}`);
    } else {
      console.error("❌ 転送失敗");
    }

  } catch (error) {
    console.error("❌ エラー:", error.message);
    process.exit(1);
  }
}

transferERC20();