import "dotenv/config";
import { HardhatUserConfig } from "hardhat/types";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "@tenderly/hardhat-tenderly";
import { accounts, node_url, ownerKeyHardhat } from "./utils/network";

import "./tasks";

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.6"
  },
  namedAccounts: {
    owner: 0
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  networks: {
    hardhat: {
      deploy: ["deploy/common", "deploy/testnet"],
      forking: {
        url: node_url("goerli"),
        blockNumber: 5331479
      },
      companionNetworks: {
        l1: "hardhat"
      },
      accounts: [
        {
          privateKey: ownerKeyHardhat(),
          balance: "10000000000000000000000000"
        },
        {
          privateKey: "0x1ab42cc412b618bdea3a599e3c9bae199ebf030895b039e9db1e30dafb12b727",
          balance: "10000000000000000000000000"
        },
        {
          privateKey: "0x9a983cb3d832fbde5ab49d692b7a8bf5b5d232479c99333d0fc8e1d21f1b55b6",
          balance: "10000000000000000000000000"
        }
      ]
    },
    goerli: {
      deploy: ["deploy/common", "deploy/l1"],
      url: node_url("goerli"),
      accounts: accounts("goerli"),
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 4
    },
    mumbai: {
      deploy: ["deploy/common", "deploy/l2"],
      url: node_url("mumbai"),
      accounts: accounts("mumbai"),
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1.5,
      companionNetworks: {
        l1: "goerli"
      }
    },
    mainnet: {
      deploy: ["deploy/common", "deploy/l1"],
      url: node_url("mainnet"),
      accounts: accounts("mainnet"),
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1.5
    },
    matic: {
      deploy: ["deploy/common", "deploy/l2"],
      url: node_url("matic"),
      accounts: accounts("matic"),
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1.5,
      companionNetworks: {
        l1: "mainnet"
      }
    }
  },
  paths: {
    artifacts: "artifacts",
    deployments: "deployments"
  }
};

export default config;

