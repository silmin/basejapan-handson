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
 * 共通のデプロイ設定とクライアントを作成
 */
export async function createDeployClients() {
  // 環境変数チェック
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEYが.envファイルに設定されていません");
  }

  if (!process.env.RPC_URL) {
    throw new Error("RPC_URLが.envファイルに設定されていません");
  }

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

  return { account, publicClient, walletClient };
}

/**
 * 残高とガス価格をチェック
 */
export async function checkBalanceAndGas(publicClient, account) {
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

  const gasPrice = await publicClient.getGasPrice();
  console.log(
    `⛽ ガス価格: ${formatEther(gasPrice * BigInt(1000000))} ETH/1M gas`
  );

  return { balance, gasPrice };
}

/**
 * コンパイル済みコントラクトを読み込み
 */
export function loadCompiledContract(contractName) {
  const compiledPath = path.join(
    process.cwd(),
    "compiled",
    `${contractName}.json`
  );
  
  if (!fs.existsSync(compiledPath)) {
    throw new Error(
      `コンパイル済みコントラクト ${contractName}.json が見つかりません。先に npm run compile を実行してください`
    );
  }

  const contractData = JSON.parse(fs.readFileSync(compiledPath, "utf8"));
  return contractData;
}

/**
 * デプロイ結果を表示
 */
export function displayDeployResults(receipt, gasPrice, contractName) {
  console.log("✅ デプロイ成功！");
  console.log(`📍 コントラクトアドレス: ${receipt.contractAddress}`);
  console.log(`⛽ 使用ガス: ${receipt.gasUsed.toString()}`);
  console.log(
    `💰 トランザクション費用: ${formatEther(
      receipt.gasUsed * gasPrice
    )} ETH`
  );
  console.log(`📦 ブロック番号: ${receipt.blockNumber}`);
  console.log(
    `🔍 Base Sepolia Explorer: https://sepolia.basescan.org/address/${receipt.contractAddress}`
  );
}

/**
 * .envファイルを更新
 */
export function updateEnvFile(contractAddress, envKey) {
  try {
    const envPath = path.join(process.cwd(), ".env");
    let envContent = fs.readFileSync(envPath, "utf8");

    if (envContent.includes(`${envKey}=`)) {
      // 既存の値を更新
      envContent = envContent.replace(
        new RegExp(`${envKey}=.*`),
        `${envKey}=${contractAddress}`
      );
    } else {
      // 新しく追加
      envContent += `\n${envKey}=${contractAddress}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ .envファイルに${envKey}を自動追加しました`);
  } catch (error) {
    console.log(
      "⚠️  .envファイルの自動更新に失敗しました。手動で追加してください。"
    );
  }
}

/**
 * エラーハンドリング
 */
export function handleDeployError(error) {
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