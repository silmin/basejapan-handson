import {
  createDeployClients,
  checkBalanceAndGas,
  loadCompiledContract,
  displayDeployResults,
  updateEnvFile,
  handleDeployError,
} from "./deploy-utils.js";

/**
 * ERC20TokenコントラクトをBase Sepoliaテストネットにデプロイします
 */
async function deployERC20() {
  try {
    console.log("🚀 ERC20Tokenコントラクトをデプロイ中...");
    console.log("🌐 ネットワーク: Base Sepolia Testnet");

    // 共通設定とクライアント作成
    const { account, publicClient, walletClient } = await createDeployClients();

    // 残高とガス価格チェック
    const { gasPrice } = await checkBalanceAndGas(publicClient, account);

    // コンパイル済みコントラクトを読み込み
    const { abi, bytecode } = loadCompiledContract("ERC20Token");

    // トークンのパラメータ設定
    const tokenName = "BaseJapan Token";
    const tokenSymbol = "BJT";
    const tokenDecimals = 18;
    const tokenTotalSupply = 1000000; // 1,000,000 tokens

    console.log("📄 コントラクトをデプロイしています...");
    console.log(`📝 トークン名: ${tokenName}`);
    console.log(`🔤 シンボル: ${tokenSymbol}`);
    console.log(`🔢 小数点桁数: ${tokenDecimals}`);
    console.log(`💎 総発行量: ${tokenTotalSupply.toLocaleString()} ${tokenSymbol}`);

    // コントラクトをデプロイ
    const hash = await walletClient.deployContract({
      abi,
      bytecode,
      args: [tokenName, tokenSymbol, tokenDecimals, tokenTotalSupply],
    });

    console.log(`📋 デプロイトランザクション Hash: ${hash}`);
    console.log("⏳ トランザクションの確認を待っています...");

    // トランザクションレシートを取得
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

    if (receipt.status === "success") {
      displayDeployResults(receipt, gasPrice, "ERC20Token");

      console.log("\n💡 次のステップ:");
      console.log(`1. .envファイルに以下の行を追加してください:`);
      console.log(`   ERC20_CONTRACT_ADDRESS=${receipt.contractAddress}`);
      console.log(
        "2. npm run execute-erc20 でコントラクトとのやり取りを試してください"
      );

      // 自動で.envファイルを更新
      updateEnvFile(receipt.contractAddress, "ERC20_CONTRACT_ADDRESS");
    } else {
      console.error("❌ デプロイ失敗");
      console.error("レシート:", receipt);
    }
  } catch (error) {
    handleDeployError(error);
  }
}

// スクリプト実行
deployERC20();