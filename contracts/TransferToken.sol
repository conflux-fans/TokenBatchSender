// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.8.0;

// import "@openzeppelin/contracts/token/ERC777/ERC777.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/introspection/IERC1820Registry.sol";


contract TransferToken is IERC777Recipient {
    
    IERC1820Registry constant internal _ERC1820_REGISTRY = IERC1820Registry(0x88887eD889e776bCBe2f0f9932EcFaBcDfCd1820);
    
    mapping(address => bool) internal _TRUSTED_CONTRACTS;
    address internal _MANAGER;

    modifier onlyManager {
        require(msg.sender == _MANAGER, "Sender is not manager");
        _;
    }

    constructor(address[] memory trusted_contracts)
        public
    {
        for (uint i = 0; i < trusted_contracts.length; i++) {
            _TRUSTED_CONTRACTS[trusted_contracts[i]] = true;
        }
        _MANAGER = msg.sender;
        // keccak256(abi.encodePacked("ERC777TokensRecipient")) == 0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b
        _ERC1820_REGISTRY.setInterfaceImplementer(address(this), 0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b, address(this));
    }

    function isTrustedContract(address c) public view returns (bool) {
        return _TRUSTED_CONTRACTS[c];
    }

    function setTrustedContractState(address c, bool state) public onlyManager {
        // require(msg.sender == _MANAGER);
        _TRUSTED_CONTRACTS[c] = state;
    }

    function retrieveToken(address tokenContract, uint value) public onlyManager {
        // require balance > value
        // address implementer = _ERC1820_REGISTRY.getInterfaceImplementer(msg.sender, keccak256("ERC777Token"));
        // require (implementer != address(0), "Token contract should be an erc777 contract");

        require(IERC20(tokenContract).balanceOf(address(this)) >= value, "Transfer value is greater than contract balance");
        IERC20(tokenContract).transfer(_MANAGER ,value);
    }

    // @notice called when someone attempts to transfer ERC-777 tokens to this address.  If this function were to throw or doesn't exist, then the token transfer would fail.
    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) override external {
        require(to == address(this), "should transfer to this contract");
        // require msg.sender be trusted contracts
        require(_TRUSTED_CONTRACTS[msg.sender], "The ERC777 Token is not registered in routing contract");

        (address[] memory tos,uint256[] memory vals) = abi.decode(userData, (address[], uint256[]));

        
        uint256 length = tos.length;

        require(tos.length == vals.length, "tos and vals length not match");

        // 检查 amount 相同
        uint256 sum = 0;
        for (uint256 i = 0; i < length; ++i) {
            sum += vals[i];
        }
        require(sum == amount, "Amount should equal to the sum of transfer");

        // msg.sender是被信任的 因此其implementer也是被信任的
        // 或者要求 msg.sender == implementer，这样能否不用设置 trusted contracts？
        address implementer = _ERC1820_REGISTRY.getInterfaceImplementer(msg.sender, keccak256("ERC777Token"));
        require (implementer != address(0), "Message sender should be an erc777 contract");
        for (uint256 i = 0; i < length; ++i) {
            IERC777(implementer).send(tos[i], vals[i], "");
        }
    }
}
