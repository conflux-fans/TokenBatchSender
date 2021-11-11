import { abi } from "../../../build/contracts/SponsorWhitelistControl.json";

const testnetSponsorContractAddress =
  "cfxtest:aaejuaaaaaaaaaaaaaaaaaaaaaaaaaaaaeprn7v0eh";
const mainnetSponsorContractAddress =
  "cfx:aaejuaaaaaaaaaaaaaaaaaaaaaaaaaaaaegg2r16ar";

const sponsorContractConfig = {
  1: {
    abi,
    // bytecode: Sponsor.bytecode,
    address: testnetSponsorContractAddress,
  },
  1029: {
    abi,
    // bytecode: Sponsor.bytecode,
    address: mainnetSponsorContractAddress,
  },
};

export default sponsorContractConfig;
