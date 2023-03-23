import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const { INFURA_GOERLI_API_KEY, TEST_PRIVATE_KEY, INFURA_SEPOLIA_API_KEY } =
  process.env;

if (!INFURA_GOERLI_API_KEY || !TEST_PRIVATE_KEY) {
  throw new Error("Missing env variables");
}

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_GOERLI_API_KEY}`,
      accounts: [TEST_PRIVATE_KEY],
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_SEPOLIA_API_KEY}`,
      accounts: [TEST_PRIVATE_KEY],
    },
  },
};

export default config;
