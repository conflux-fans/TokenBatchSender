const NetworkType = {
  
  TestNet: "TestNet",
  MainNet: "MainNet",
  NotSpecified: "NotSpecified",
  // 1029, main net address
  // -1, hex address
  // other, test net address(1) or other network
  fromNetId: function (netId) {
    netId = parseInt(netId)
    
    switch (netId) {
      case -1:
        return NetworkType.NotSpecified
      case 1029:
        return NetworkType.MainNet;
      default:
        return NetworkType.TestNet;
    }
  }
};

Object.freeze(NetworkType);

export default NetworkType;
