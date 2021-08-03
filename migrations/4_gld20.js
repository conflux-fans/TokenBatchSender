const GLD20 = artifacts.require("GLD20");

module.exports = function (deployer) {
  deployer.deploy(GLD20, 114514);
};
