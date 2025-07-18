import fs from "fs";
import path from "path";
import solc from "solc";

/**
 * SimpleStorageコントラクトをコンパイルし、ABIとバイトコードを生成します
 */
async function compileSimpleStorage() {
  console.log("🔧 SimpleStorageコントラクトをコンパイル中...");

  try {
    // contracts/SimpleStorage.solファイルを読み込み
    const contractPath = path.join(
      process.cwd(),
      "contracts",
      "SimpleStorage.sol"
    );
    
    if (!fs.existsSync(contractPath)) {
      throw new Error(`SimpleStorage.solファイルが見つかりません: ${contractPath}`);
    }
    
    const source = fs.readFileSync(contractPath, "utf8");

    // Solidityコンパイラの入力設定
    const input = {
      language: "Solidity",
      sources: {
        "SimpleStorage.sol": {
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
      output.contracts["SimpleStorage.sol"]["SimpleStorage"];
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
      contractName: "SimpleStorage",
    };

    fs.writeFileSync(
      path.join(compiledDir, "SimpleStorage.json"),
      JSON.stringify(contractData, null, 2)
    );

    console.log("✅ SimpleStorageコンパイル完了！");
    console.log(`📁 出力先: compiled/SimpleStorage.json`);
    console.log(`📊 ABI entries: ${abi.length}`);
    console.log(`💾 Bytecode size: ${bytecode.length / 2} bytes`);
  } catch (error) {
    console.error("❌ コンパイルエラー:", error.message);
    process.exit(1);
  }
}

// スクリプト実行
compileSimpleStorage();