const NetworkType = {
  
  TestNet: "TestNet",
  MainNet: "MainNet",
  NotSpecified: "NotSpecified",
  // 1029, main net address
  // -1, hex address
  // other, test net address(1) or other network
  fromNetId(netId) {
    const id = parseInt(netId)
    
    if (isNaN(id)) {
      throw new Error('Unexpected net Id: ' + netId)
    }

    switch (id) {
      case -1:
        return NetworkType.NotSpecified
      case 1029:
        return NetworkType.MainNet;
      default:
        return NetworkType.TestNet;
    }
  },
  getNetId(address, sdk) {
    if (sdk.address.hasNetworkPrefix(address)) {
      return sdk.address.decodeCfxAddress(address).netId;
    } else {
      // an invalid address will throw an error
      sdk.format.hexAddress(address)
      return -1
    }
  },
  // use sdk
  isValidAddress(address, chainId, sdk) {
    const id = NetworkType.getNetId(address, sdk)

    const addressType = NetworkType.fromNetId(id)
    const netType = NetworkType.fromNetId(chainId)

    switch (netType) {
      case NetworkType.MainNet:
        // 主网中合法的地址是主网地址与十六进制地址
        return addressType === NetworkType.MainNet || addressType === NetworkType.NotSpecified
      // 网络为测试网时
      case NetworkType.TestNet:
        // 非测试网地址一定合法
        if (addressType !== NetworkType.TestNet) {
          return true
        } else {
          // 如果是测试网地址，则要求id相同（netId 非 1 的网络也被认为是测试网）
          // not strict equal
          return id == chainId
        }
      default:
        throw new Error('unexpected portal network id: ' + chainId)
    }
  }
};

Object.freeze(NetworkType);

export default NetworkType;
