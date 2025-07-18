import { createPublicClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

/**
 * ERC20トークンの残高を確認します
 */
async function checkERC20Balance() {
  try {
    console.log("💰 ERC20トークンの残高を確認中...");
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

    const contractAddress = process.env.ERC20_CONTRACT_ADDRESS;
    console.log(`📍 コントラクトアドレス: ${contractAddress}`);
    console.log(`👤 チェック対象アドレス: ${account.address}`);

    // トークンシンボルを取得
    const symbol = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "symbol",
    });

    // 残高を確認
    const balance = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "balanceOf",
      args: [account.address],
    });

    console.log(`\n📊 残高: ${formatEther(balance)} ${symbol}`);
    console.log(`🔍 Base Sepolia Explorer: https://sepolia.basescan.org/address/${contractAddress}`);

  } catch (error) {
    console.error("❌ エラー:", error.message);
    process.exit(1);
  }
}

checkERC20Balance();