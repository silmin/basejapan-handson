import fs from "fs";
import path from "path";
import solc from "solc";

/**
 * ERC20Tokenコントラクトをコンパイルし、ABIとバイトコードを生成します
 */
async function compileERC20() {
  console.log("🔧 ERC20Tokenコントラクトをコンパイル中...");

  try {
    // contracts/ERC20Token.solファイルを読み込み
    const contractPath = path.join(
      process.cwd(),
      "contracts",
      "ERC20Token.sol"
    );
    
    if (!fs.existsSync(contractPath)) {
      throw new Error(`ERC20Token.solファイルが見つかりません: ${contractPath}`);
    }
    
    const source = fs.readFileSync(contractPath, "utf8");

    // Solidityコンパイラの入力設定
    const input = {
      language: "Solidity",
      sources: {
        "ERC20Token.sol": {
          content: source,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    };

    // コンパイル実行
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // エラーチェック
    if (output.errors) {
      const hasErrors = output.errors.some(
        (error) => error.severity === "error"
      );

      output.errors.forEach((error) => {
        if (error.severity === "error") {
          console.error("❌ コンパイルエラー:", error.formattedMessage);
        } else {
          console.warn("⚠️  警告:", error.formattedMessage);
        }
      });

      if (hasErrors) {
        process.exit(1);
      }
    }

    // コンパイル結果から必要な情報を抽出
    const contractOutput =
      output.contracts["ERC20Token.sol"]["ERC20Token"];
    const abi = contractOutput.abi;
    const bytecode = contractOutput.evm.bytecode.object;

    // compiled/ディレクトリを作成
    const compiledDir = path.join(process.cwd(), "compiled");
    if (!fs.existsSync(compiledDir)) {
      fs.mkdirSync(compiledDir, { recursive: true });
    }

    // ABIとバイトコードをファイルに保存
    const contractData = {
      abi: abi,
      bytecode: "0x" + bytecode,
      contractName: "ERC20Token",
    };

    fs.writeFileSync(
      path.join(compiledDir, "ERC20Token.json"),
      JSON.stringify(contractData, null, 2)
    );

    console.log("✅ ERC20Tokenコンパイル完了！");
    console.log(`📁 出力先: compiled/ERC20Token.json`);
    console.log(`📊 ABI entries: ${abi.length}`);
    console.log(`💾 Bytecode size: ${bytecode.length / 2} bytes`);
  } catch (error) {
    console.error("❌ コンパイルエラー:", error.message);
    process.exit(1);
  }
}

// スクリプト実行
compileERC20();