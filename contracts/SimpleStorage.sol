// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SimpleStorage
 * @dev 数値を保存・取得できるシンプルなスマートコントラクト
 */
contract SimpleStorage {
    // 保存される数値
    uint256 private storedNumber;
    
    // コントラクトの所有者
    address public owner;
    
    // イベント：数値が保存されたときに発火
    event NumberStored(uint256 indexed newNumber, address indexed sender);
    
    // イベント：数値が取得されたときに発火
    event NumberRetrieved(uint256 indexed number, address indexed sender);
    
    /**
     * @dev コンストラクタ：デプロイ時にコントラクトの所有者を設定
     */
    constructor() {
        owner = msg.sender;
        storedNumber = 0;
    }
    
    /**
     * @dev 数値を保存する関数
     * @param _number 保存したい数値
     */
    function store(uint256 _number) public {
        storedNumber = _number;
        emit NumberStored(_number, msg.sender);
    }
    
    /**
     * @dev 保存された数値を取得する関数
     * @return 保存されている数値
     */
    function retrieve() public returns (uint256) {
        emit NumberRetrieved(storedNumber, msg.sender);
        return storedNumber;
    }
    
    /**
     * @dev 保存された数値を取得する関数（view版：ガス不要）
     * @return 保存されている数値
     */
    function retrieveView() public view returns (uint256) {
        return storedNumber;
    }
    
    /**
     * @dev コントラクトの所有者を確認する関数
     * @return コントラクトの所有者のアドレス
     */
    function getOwner() public view returns (address) {
        return owner;
    }
    
    /**
     * @dev 数値に加算する関数
     * @param _value 加算する値
     */
    function add(uint256 _value) public {
        storedNumber += _value;
        emit NumberStored(storedNumber, msg.sender);
    }
    
    /**
     * @dev 数値をリセットする関数（所有者のみ実行可能）
     */
    function reset() public {
        require(msg.sender == owner, "Only owner can reset");
        storedNumber = 0;
        emit NumberStored(0, msg.sender);
    }
}
