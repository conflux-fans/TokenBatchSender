import NP from 'number-precision'

const testNetUrl = "https://testnet.confluxscan.io"
const mainNetUrl = "https://confluxscan.io"

const prefixMap = {
  1: testNetUrl,
  1029: mainNetUrl
}

// type: "transaction" or "address"
function getScanUrl(content, type, networkId) {
  return [prefixMap[parseInt(networkId)], type, content].join('/')
}

function getScanHtml(content, type, networkId, text) {
  // let html = `<el-link icon="el-icon-s-home" type="primary">主页</el-link>`
  let html = `<i class='el-icon-top-right'></i>`
  return `<a href="${getScanUrl(content, type, networkId)} " target="_blank">${text + html}</a>`
}

function hexStringToArrayBuffer(hexString) {
  // remove the leading 0x
  hexString = hexString.replace(/^0x/, "");

  // ensure even number of characters
  if (hexString.length % 2 != 0) {
    console.log(
      "WARNING: expecting an even number of characters in the hexString"
    );
  }

  // check for some non-hex characters
  var bad = hexString.match(/[G-Z\s]/i);
  if (bad) {
    console.log("WARNING: found non-hex characters", bad);
  }

  // split the string into pairs of octets
  var pairs = hexString.match(/[\dA-F]{2}/gi);

  // convert the octets to integers
  var integers = pairs.map(function (s) {
    return parseInt(s, 16);
  });

  var array = new Uint8Array(integers);
  return array.buffer;
}

function preciseSum(arr) {
  return arr.reduce((x, y) => NP.plus(x, y), 0)
}

export {
  getScanUrl,
  getScanHtml,
  hexStringToArrayBuffer,
  preciseSum
};