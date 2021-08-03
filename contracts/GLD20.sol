// contracts/GLD20.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// ERC20 代币 用于测试发生 ERC20 代币误转账时的提币功能
contract GLD20 is ERC20 {
    constructor(uint256 initialSupply) public ERC20("Gold", "GLD") {
        _mint(msg.sender, initialSupply);
    }
}