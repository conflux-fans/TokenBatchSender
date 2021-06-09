// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.8.0;

import "./ERC777.sol";

// ERC777 sample contract with a tap
// test needed
contract ERC777ForTest is ERC777 {
  
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

    // 注意 这个实现是不合法的 这里只是为了测试
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    // function mint(uint256 amount) public {
    //     _mint(msg.sender, 1e18 * amount, "", "");
    // }
}
