// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.8.0;

import "./ERC777.sol";

// 标准 ERC777 实现，可用于部署测试代币
contract GLDToken is ERC777 {
  
    constructor(
        uint256 initialSupply,
        address[] memory defaultOperators
    )
        ERC777("Golden", "GLD", defaultOperators)
        public
    {
        _mint(msg.sender, initialSupply, "", "");
    }
}
