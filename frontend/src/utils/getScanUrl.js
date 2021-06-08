const testNetUrl = "https://testnet.confluxscan.io"
const mainNetUrl = "https://confluxscan.io"

const prefixMap = {
  1: testNetUrl,
  1029: mainNetUrl,
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
