const Migrations = artifacts.require("Migrations");
const GLDToken = artifacts.require("GLDToken");
const GLD20 = artifacts.require("GLD20");
const TransferToken = artifacts.require("TransferToken")
const { expectRevert, expectEvent, constants, balance, BN, time } = require("@openzeppelin/test-helpers");

// const { web3 } = require('@openzeppelin/test-helpers/src/setup');

contract("TokenBatchSender", async (accounts) => {

  /**
   * 
   * @param {address[]} tos 
   * @param {string[]} vals NOTE: 在实际运行中 这个数一般是个大数
   */
  function toData(tos, vals) {
    const data = web3.eth.abi.encodeParameters(
      ["address[]", "uint256[]"],
      [
        tos.map((addr) => cfxsdk.format.hexAddress(addr)),
        vals,
      ]
    )
    return data
  }

  // 注意每次都要重新部署 消耗gas量较大 
  beforeEach(async () => {
    this.initialSupply = 1145141919
    // this.accounts = accounts
    this.token = await GLDToken.new(this.initialSupply,[])
    this.router = await TransferToken.new([this.token.address])
    // console.log(this.token.address)
  })

  // TODO: 1820合约当前是手动创建的，需要自动搭建1820环境

  describe("init", async () => {
    it("Check trusted token contract", async () => {
      // const instance = await ERC777GLDToken.new(1145141919,[]);
      let trusted = await this.router.isTrustedContract(this.token.address);
      // console.log(balance)
      expect(trusted).to.equal(true)
    });
  });

  describe("Token batch sending", async () => {
    it("Successfully transfer token", async() => {
      const tos = [accounts[1], accounts[2], accounts[3], accounts[4]]
      const vals = [1, 2, 3, 4]
      const data = toData(tos, vals)

      const sum = vals.reduce((x, y) => (x + y), 0)

      await this.token.send(this.router.address, sum, data)

      let balanceList = []
      for (let i = 0; i < tos.length; ++i) {
        balanceList.push((await this.token.balanceOf(tos[i])).toString())
        expect(balanceList[i]).to.equal(vals[i].toString())

      }

      const senderBalance = (await this.token.balanceOf(accounts[0])).toString()
      expect(senderBalance).to.equal((this.initialSupply - sum).toString())
    })

    it("Revert for wrong sum", async() => {
      const tos = [accounts[1], accounts[2], accounts[3], accounts[4]]
      const vals = [1, 2, 3, 4]
      const data = toData(tos, vals)

      const sum = vals.reduce((x, y) => (x + y), 0)

      await expectRevert(this.token.send(this.router.address, sum - 1, data), "Amount should equal to the sum of transfer")
    })

    it("Revert for mismatch length", async() => {
      const tos = [accounts[1], accounts[2], accounts[3], accounts[4]]
      const vals = [1, 2, 3]
      const data = toData(tos, vals)

      const sum = vals.reduce((x, y) => (x + y), 0)

      await expectRevert(this.token.send(this.router.address, sum, data), "tos and vals length not match")
    })
  })

  describe("Cfx batch sending", async () => {
    it("Successfully transfer cfx", async() => {
      const tos = [accounts[1], accounts[2], accounts[3], accounts[4]]
      const vals = [1, 2, 3, 4]
      const data = toData(tos, vals)

      const sum = vals.reduce((x, y) => (x + y), 0)

      let balanceList = []
      for (let i = 0; i < tos.length; ++i) {
        balanceList.push(new BN(await web3.eth.getBalance(tos[i])))
      }

      await this.router.distributeCfx(data, {
        value: sum
      })

      let newBalanceList = []

      for (let i = 0; i < tos.length; ++i) {
        newBalanceList.push(new BN(await web3.eth.getBalance(tos[i])))
        expect(newBalanceList[i].sub(balanceList[i]).toString()).to.equal(vals[i].toString())
      }
    })

    it("Revert for wrong sum", async() => {
      const tos = [accounts[1], accounts[2], accounts[3], accounts[4]]
      const vals = [1, 2, 3, 4]
      const data = toData(tos, vals)

      const sum = vals.reduce((x, y) => (x + y), 0)

      await expectRevert(this.router.distributeCfx(data, {
        value: sum-1
      }), "Amount should equal to the sum of transfer")
    })

    it("Revert for mismatch length", async() => {
      const tos = [accounts[1], accounts[2], accounts[3], accounts[4]]
      const vals = [1, 2, 3]
      const data = toData(tos, vals)

      const sum = vals.reduce((x, y) => (x + y), 0)

      await expectRevert(this.router.distributeCfx(data, {
        value: sum
      }), "tos and vals length not match")
    })
  })

  describe("Retrive ERC20 Token", async () => {
    it("Manager retrieves ERC20 token from routing contract", async () => {
      token20 = await GLD20.new(100)
      await token20.transfer(this.router.address, 100)
      let balance = await token20.balanceOf(this.router.address)

      expect(balance.toString()).to.equal("100")

      await this.router.retrieveToken(token20.address, 100);
      balance = await token20.balanceOf(accounts[0])
      expect(balance.toString()).to.equal("100")
    })

    it("User other than manager cannot retrieves ERC20 token from routing contract", async () => {
      token20 = await GLD20.new(100)
      await token20.transfer(this.router.address, 100)
      let balance = await token20.balanceOf(this.router.address)

      expect(balance.toString()).to.equal("100")

      await expectRevert(this.router.retrieveToken(token20.address, 100, {
        from: accounts[1]
      }), "Sender is not manager")
    })
  })

  // 需要注意的是 合约中这种处理方式可能是冗余的 后续可能会有改进
  describe("Malicious attacker", async () => {
    it("Revert for manually call tokensReceived interface", async() => {
      const tos = [accounts[1]]
      const vals = [4]
      const data = toData(tos, vals)

      const sum = vals.reduce((x, y) => (x + y), 0)

      await expectRevert(this.router.tokensReceived(
        accounts[1], // unused var operator
        accounts[1], // unused var from
        this.router.address, // to
        4, // amount
        data, // userData
        data, // unused var operatorData
      ), "The ERC777 Token is not registered in routing contract")
    })
  })
});
