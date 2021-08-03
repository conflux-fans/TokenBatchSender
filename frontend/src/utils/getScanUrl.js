const testScanNetUrl = "https://testnet.confluxscan.io"
const mainNetScanUrl = "https://confluxscan.io"

const prefixMap = {
  1: testScanNetUrl,
  1029: mainNetScanUrl,
}

/**
 * @param content tx hash or account / contract address
 * @param type "transaction" or "address"
 * @param networkId 1 for testnet and 1029 for mainnet
 * */ 
function getScanUrl(content, type, networkId) {
  return [prefixMap[parseInt(networkId)], type, content].join('/')
}

export default getScanUrl;
