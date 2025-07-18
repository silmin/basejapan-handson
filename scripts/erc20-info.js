import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

/**
 * ERC20トークンの基本情報を表示します
 */
async function showERC20Info() {
  try {
    console.log("📋 ERC20トークンの基本情報を取得中...");
    console.log("🌐 ネットワーク: Base Sepolia Testnet");

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

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.RPC_URL),
    });

    const contractAddress = process.env.ERC20_CONTRACT_ADDRESS;
    console.log(`📍 コントラクトアドレス: ${contractAddress}`);

    // トークンの基本情報を取得
    const name = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "name",
    });

    const symbol = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "symbol",
    });

    const decimals = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "decimals",
    });

    const totalSupply = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "totalSupply",
    });

    console.log("\n🎯 トークン情報:");
    console.log(`📝 名前: ${name}`);
    console.log(`🔤 シンボル: ${symbol}`);
    console.log(`🔢 小数点桁数: ${decimals}`);
    console.log(`💎 総発行量: ${formatEther(totalSupply)} ${symbol}`);
    console.log(`🔍 Base Sepolia Explorer: https://sepolia.basescan.org/address/${contractAddress}`);

  } catch (error) {
    console.error("❌ エラー:", error.message);
    process.exit(1);
  }
}

showERC20Info();