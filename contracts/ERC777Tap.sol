// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.8.0;

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

// ERC777 sample contract with a tap
// test needed
contract ERC777Tap is ERC777 {
  
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply,
        address[] memory defaultOperators
    )
        ERC777(name_, symbol_, defaultOperators)
        public
    {
        _mint(msg.sender, initialSupply, "", "");
    }

    // function mint(uint256 amount) public {
    //     _mint(msg.sender, 1e18 * amount, "", "");
    // }
}
