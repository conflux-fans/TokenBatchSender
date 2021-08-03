/**
 * Convert a hex string to an ArrayBuffer.
 * https://gist.github.com/don/871170d88cf6b9007f7663fdbc23fe09
 * 
 * @param {string} hexString - hex representation of bytes
 * @return {ArrayBuffer} - The bytes in an ArrayBuffer.
 */
function hexStringToArrayBuffer(hexString) {
  // remove the leading 0x
  hexString = hexString.replace(/^0x/, "");

  // ensure even number of characters
  if (hexString.length % 2 != 0) {
    throw new Error(
      "WARNING: expecting an even number of characters in the hexString"
    );
  }

  // check for some non-hex characters
  var bad = hexString.match(/[G-Z\s]/i);
  if (bad) {
    throw new Error("WARNING: found non-hex characters", bad);
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


export default hexStringToArrayBuffer;