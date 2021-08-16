import "dotenv/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

interface BBPolyConfig {
  [key: string]: BBNetConfig;
}

interface BBNetConfig {
  path: string,
  seed: string,
  tokenAddress: string,
  rootChainManager: string,
  erc20Predicate: string,
  stateSender: string,
  checkpointManger: string,
  fxRoot: string,
  fxChild: string,
  withdrawCooldown: number,
  extra: any,
}

export function config(hre: HardhatRuntimeEnvironment): BBNetConfig {
  const networkName = hre.network.name;
  const addressZero = hre.ethers.constants.AddressZero;
  const cfg = {
    "hardhat": {
      path: "deploy-testnet",
      seed: "xyz01",
      tokenAddress: "0xd7d55Fd7763A356aF99f17C9d6c21d933bC2e2F1",
      rootChainManager: "0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74",
      erc20Predicate: "0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34",
      checkpointManger: "0x2890bA17EfE978480615e330ecB65333b880928e",
      fxRoot: "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA",
      fxChild: "0xCf73231F28B7331BBe3124B907840A94851f9f11",
      stateSender: "0xEAa852323826C71cd7920C3b4c007184234c3945",
      withdrawCooldown: 2000,
      extra: {
        layer2BondAddress: "0xebB83c1b86A27eb9e2523A2c117F1d656269dbAE"
      }
    },
    "goerli": {
      path: "deploy-goerli",
      seed: "xyz02",
      tokenAddress: "0xd7d55Fd7763A356aF99f17C9d6c21d933bC2e2F1",
      rootChainManager: "0xBbD7cBFA79faee899Eaf900F13C9065bF03B1A74",
      erc20Predicate: "0xdD6596F2029e6233DEFfaCa316e6A95217d4Dc34",
      stateSender: "0xEAa852323826C71cd7920C3b4c007184234c3945",
      checkpointManger: "0x2890bA17EfE978480615e330ecB65333b880928e",
      fxRoot: "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA",
      fxChild: "", // empty
      withdrawCooldown: 0,
      extra: null
    },
    "mumbai": {
      path: "deploy-mumbai",
      seed: "xyz02",
      tokenAddress: "0xebB83c1b86A27eb9e2523A2c117F1d656269dbAE",
      rootChainManager: addressZero,
      erc20Predicate: addressZero,
      stateSender: addressZero,
      checkpointManger: "0x2890bA17EfE978480615e330ecB65333b880928e",
      fxRoot: "0x3d1d3E34f7fB6D26245E6640E1c50710eFFf15bA",
      fxChild: "0xCf73231F28B7331BBe3124B907840A94851f9f11",
      withdrawCooldown: 10, // 201600
      extra: null
    },
    "mainnet": {
      path: "deploy-mainnet",
      seed: "prod01",
      tokenAddress: "0x0391d2021f89dc339f60fff84546ea23e337750f",
      rootChainManager: "0xA0c68C638235ee32657e8f720a23ceC1bFc77C77",
      erc20Predicate: "0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf",
      stateSender: "0x28e4F3a7f651294B9564800b2D01f35189A5bFbE",
      checkpointManger: "0x86e4dc95c7fbdbf52e33d563bbdb00823894c287",
      fxRoot: "0xfe5e5D361b2ad62c541bAb87C45a0B9B018389a2",
      fxChild: "", // empty
      withdrawCooldown: 0,
      extra: null
    },
    "matic": {
      path: "deploy-matic",
      seed: "prod01",
      tokenAddress: "0xA041544fe2BE56CCe31Ebb69102B965E06aacE80",
      rootChainManager: addressZero,
      erc20Predicate: addressZero,
      stateSender: addressZero,
      checkpointManger: "0x86e4dc95c7fbdbf52e33d563bbdb00823894c287",
      fxRoot: "0xfe5e5D361b2ad62c541bAb87C45a0B9B018389a2",
      fxChild: "0x8397259c983751DAf40400790063935a11afa28a",
      withdrawCooldown: 201600,
      extra: null
    }
  } as BBPolyConfig;

  return cfg[networkName];
}
