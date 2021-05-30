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

function moveDecimal(num, deltaDecimal) {
  let rtn = num;

  if (deltaDecimal >= 0) {
    for (let i = 0; i < deltaDecimal; ++i) {
      rtn = NP.times(rtn, 10)
    }
  } else {
    for (let i = 0; i < -deltaDecimal; ++i) {
      rtn = NP.divide(rtn, 10)
    }
  }
  return rtn
}

// window.NP = NP

export {
  getScanUrl,
  hexStringToArrayBuffer,
  preciseSum,
  moveDecimal,
};