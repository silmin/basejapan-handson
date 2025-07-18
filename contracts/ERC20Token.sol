// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ERC20Token
 * @dev ERC-20標準に準拠したトークンコントラクト
 * 学習用のシンプルなERC-20実装
 */
contract ERC20Token {
    // トークンの基本情報
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    // 各アドレスの残高
    mapping(address => uint256) public balanceOf;
    
    // 承認された転送可能額
    mapping(address => mapping(address => uint256)) public allowance;
    
    // イベント定義
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    /**
     * @dev コンストラクタ
     * @param _name トークン名
     * @param _symbol トークンシンボル
     * @param _decimals 小数点以下の桁数
     * @param _totalSupply 総発行量
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * 10**decimals;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    /**
     * @dev トークンを転送する関数
     * @param _to 転送先アドレス
     * @param _value 転送する量
     * @return 転送の成功可否
     */
    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0), "Transfer to zero address");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    /**
     * @dev 承認する関数
     * @param _spender 承認するアドレス
     * @param _value 承認する量
     * @return 承認の成功可否
     */
    function approve(address _spender, uint256 _value) public returns (bool) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    /**
     * @dev 承認された範囲内でトークンを転送する関数
     * @param _from 転送元アドレス
     * @param _to 転送先アドレス
     * @param _value 転送する量
     * @return 転送の成功可否
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(_from != address(0), "Transfer from zero address");
        require(_to != address(0), "Transfer to zero address");
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
        
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    /**
     * @dev 新しいトークンを発行する関数（所有者のみ）
     * @param _to 発行先アドレス
     * @param _value 発行する量
     */
    function mint(address _to, uint256 _value) public {
        require(_to != address(0), "Mint to zero address");
        
        totalSupply += _value;
        balanceOf[_to] += _value;
        
        emit Transfer(address(0), _to, _value);
    }
    
    /**
     * @dev トークンを焼却する関数
     * @param _value 焼却する量
     */
    function burn(uint256 _value) public {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        balanceOf[msg.sender] -= _value;
        totalSupply -= _value;
        
        emit Transfer(msg.sender, address(0), _value);
    }
}