
const { Conflux } = require('js-conflux-sdk');
const { abi, bytecode } = require('../build/contracts/IERC1820Registry.json');
const rawList = require('./20list.json')

const lst = JSON.parse(rawList).list

// console.log(lst)

// console.log(lst)
// erc20list.forEach((item)=>{
//     console.log(item.address)
// })

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
    var integers = pairs.map(function(s) {
      return parseInt(s, 16);
    });

    var array = new Uint8Array(integers);
    // console.log(array);

    return array.buffer;
}

async function main() {
    const conflux = new Conflux({ 
        // url: 'https://main.confluxrpc.org',
        url: 'https://mainnet-rpc.conflux-chain.org.cn/v2',
        networkId: 1029,
    });

    // keccak256("ERC777")
    const interface = "ac7fbab5f54a3ca8194167523c6753bfeb96a445279294b6125b68cce2177054"
    const addr1820 = "0x88887eD889e776bCBe2f0f9932EcFaBcDfCd1820"

    const contract1820 = conflux.Contract({
        abi,
        bytecode,
        address: addr1820
    })
    /*
    list: [
        {
            address,
            name,
            symbol
        },
        {

        }
    ]
    */

    // console.log(lst[0])

    let data = [];

    // TREA and crcl_btc is not an ERC777 token
    for (let i = 0; i < lst.length; ++i) {
        const item = lst[i]
        let tmp = await contract1820.getInterfaceImplementer(item.address, hexStringToArrayBuffer(interface));
        // let tmp = await contract1820.getInterfaceImplementer(item.address, interface);

        if (tmp !== item.address) {
            console.log(item.symbol)
            console.log(item.address)
            console.log(tmp)
        } else {
            data.push({
                address: item.address,
                label: item.name,
                contractName: item.symbol
            })
        }
    }

    console.log(data)
}

main().catch((e)=>{
    console.log(e)
})