// contracts/GLD20.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract GLD20 is ERC20 {
    constructor(uint256 initialSupply) public ERC20("Gold", "GLD") {
        _mint(msg.sender, initialSupply);
    }
}