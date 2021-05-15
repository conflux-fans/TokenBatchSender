const testNetUrl = "https://testnet.confluxscan.io"
const mainNetUrl = "https://confluxscan.io"

const prefixMap = {
    1: testNetUrl,
    1029: mainNetUrl
}

// type: "transaction" or "address"
function getScanUrl(content, type, networkId) {
    console.log(networkId)
    return [prefixMap[parseInt(networkId)], type, content].join('/')
}

function getScanHtml(content, type, networkId, text) {
    // let html = `<el-link icon="el-icon-s-home" type="primary">主页</el-link>`
    let html = `<i class='el-icon-top-right'></i>`
    return `<a href="${getScanUrl(content, type, networkId)} " target="_blank">${text + html}</a>`
}

  
export { getScanUrl, getScanHtml };