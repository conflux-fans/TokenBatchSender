module.exports = {
  compilers: {
    solc: {
      version: '0.6.12',
      // docker: false
    }
  },
  networks: {
    development: {
     host: "127.0.0.1",     // Localhost (default: none)
     port: 12537,            // Standard Conflux port (default: none)
     network_id: "*",       // Any network (default: none)
     privateKeys: []
    },
  },
}
