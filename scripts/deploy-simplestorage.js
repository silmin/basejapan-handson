import {
  createDeployClients,
  checkBalanceAndGas,
  loadCompiledContract,
  displayDeployResults,
  updateEnvFile,
  handleDeployError,
} from "./deploy-utils.js";

/**
 * SimpleStorageコントラクトをBase Sepoliaテストネットにデプロイします
 */
async function deploySimpleStorage() {
  try {
    console.log("🚀 SimpleStorageコントラクトをデプロイ中...");
    console.log("🌐 ネットワーク: Base Sepolia Testnet");

    // 共通設定とクライアント作成
    const { account, publicClient, walletClient } = await createDeployClients();

    // 残高とガス価格チェック
    const { gasPrice } = await checkBalanceAndGas(publicClient, account);

    // コンパイル済みコントラクトを読み込み
    const { abi, bytecode } = loadCompiledContract("SimpleStorage");

    // コントラクトをデプロイ
    console.log("📄 コントラクトをデプロイしています...");

    const hash = await walletClient.deployContract({
      abi,
      bytecode,
      args: [], // SimpleStorageコンストラクタには引数なし
    });

    console.log(`📋 デプロイトランザクション Hash: ${hash}`);
    console.log("⏳ トランザクションの確認を待っています...");

    // トランザクションレシートを取得
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

    if (receipt.status === "success") {
      displayDeployResults(receipt, gasPrice, "SimpleStorage");

      console.log("\n💡 次のステップ:");
      console.log(`1. .envファイルに以下の行を追加してください:`);
      console.log(`   SIMPLESTORAGE_CONTRACT_ADDRESS=${receipt.contractAddress}`);
      console.log(
        "2. npm run exe:simplestorage でコントラクトとのやり取りを試してください"
      );

      // 自動で.envファイルを更新
      updateEnvFile(receipt.contractAddress, "SIMPLESTORAGE_CONTRACT_ADDRESS");
    } else {
      console.error("❌ デプロイ失敗");
      console.error("レシート:", receipt);
    }
  } catch (error) {
    handleDeployError(error);
  }
}

// スクリプト実行
deploySimpleStorage();