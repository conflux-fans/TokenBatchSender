// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.8.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

// ERC777 sample contract
contract DMDToken is ERC777 {
  
    constructor(
        uint256 initialSupply,
        address[] memory defaultOperators
    )
        ERC777("Diamond", "DMD", defaultOperators)
        public
    {
        _mint(msg.sender, initialSupply, "", "");
    }
}
