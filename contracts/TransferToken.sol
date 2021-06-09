// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/introspection/IERC1820Registry.sol";

contract TransferToken is IERC777Recipient {
    IERC1820Registry internal constant _ERC1820_REGISTRY =
        IERC1820Registry(0x88887eD889e776bCBe2f0f9932EcFaBcDfCd1820);

    mapping(address => bool) internal _trustedContracts;
    address internal _manager;

    modifier onlyManager {
        require(msg.sender == _manager, "Sender is not manager");
        _;
    }

    constructor(address[] memory trusted_contracts) public {
        for (uint256 i = 0; i < trusted_contracts.length; i++) {
            _trustedContracts[trusted_contracts[i]] = true;
        }
        _manager = msg.sender;
        // keccak256(abi.encodePacked("ERC777TokensRecipient")) == 0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b
        _ERC1820_REGISTRY.setInterfaceImplementer(
            address(this),
            0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b,
            address(this)
        );
    }

    function changeManager(address newManager) public onlyManager {
        _manager = newManager;
    }

    function isTrustedContract(address c) public view returns (bool) {
        return _trustedContracts[c];
    }

    function setTrustedContractState(address c, bool state) public onlyManager {
        // require(msg.sender == _manager);
        _trustedContracts[c] = state;
    }

    function retrieveToken(address tokenContract, uint256 value)
        public
        onlyManager
    {
        // require balance > value
        // address implementer = _ERC1820_REGISTRY.getInterfaceImplementer(msg.sender, keccak256("ERC777Token"));
        // require (implementer != address(0), "Token contract should be an erc777 contract");

        require(
            IERC20(tokenContract).balanceOf(address(this)) >= value,
            "Transfer value is greater than contract balance"
        );
        IERC20(tokenContract).transfer(_manager, value);
    }

    function distributeCfx(bytes memory userData) public payable {
        (address [] memory tos, uint256[] memory vals) =
            abi.decode(userData, (address[], uint256[]));

        uint256 length = tos.length;

        require(tos.length == vals.length, "tos and vals length not match");

        // 检查 amount 相同
        uint256 sum = 0;
        for (uint256 i = 0; i < length; ++i) {
            sum += vals[i];
        }
        require(sum == msg.value, "Amount should equal to the sum of transfer");

        for (uint256 i = 0; i < length; ++i) {
            address payable recipient = address(uint160(tos[i]));
            recipient.transfer(vals[i]);
        }
    }

    // @notice called when someone attempts to transfer ERC-777 tokens to this address.  If this function were to throw or doesn't exist, then the token transfer would fail.
    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) external override {
        require(to == address(this), "should transfer to this contract");
        // 有可能是不必要的，但暂时保留
        require(
            _trustedContracts[msg.sender],
            "The ERC777 Token is not registered in routing contract"
        );

        (address[] memory tos, uint256[] memory vals) =
            abi.decode(userData, (address[], uint256[]));

        uint256 length = tos.length;

        require(tos.length == vals.length, "tos and vals length not match");

        // 检查 amount 相同
        uint256 sum = 0;
        for (uint256 i = 0; i < length; ++i) {
            sum += vals[i];
        }
        require(sum == amount, "Amount should equal to the sum of transfer");

        // 本合约中不会有 ERC777 Token
        // 这里合约只会调用 ERC777 合约的转账接口
        address implementer =
            _ERC1820_REGISTRY.getInterfaceImplementer(
                msg.sender,
                keccak256("ERC777Token")
            );
        require(
            implementer != address(0),
            "Message sender should be an erc777 contract"
        );
        for (uint256 i = 0; i < length; ++i) {
            IERC777(implementer).send(tos[i], vals[i], "");
        }
    }
}
