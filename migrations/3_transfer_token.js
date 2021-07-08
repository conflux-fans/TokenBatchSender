const TransferToken = artifacts.require("TransferToken");

module.exports = function (deployer) {
  deployer.deploy(TransferToken, []);
};
