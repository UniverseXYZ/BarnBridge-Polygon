import { HardhatUserConfig, task } from "hardhat/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { MaticPOSClient } from "@maticnetwork/maticjs";
import { config } from "../utils/config";

task("l1-exit-and-transfer", "Exits Token and transfers to owner")
  .addParam("txHash", "Burn tx hash")
  .addParam("token", "Token to transfer")
  .setAction(async ({txHash, token}, hre) => {
    const {ethers, deployments, getNamedAccounts, getUnnamedAccounts} = hre;
    if (hre.network.name != "mainnet" && hre.network.name != "goerli") {
      console.log("wrong network");
      return;
    }
    const cfg = config(hre);
    const {owner} = await getNamedAccounts();
    const Harvester = (await ethers.getContract("PolygonTokenHarvester"));

    let network = "testnet";
    let version = "mumbai";
    let parentProvider = process.env["ETH_NODE_GOERLI"];
    let maticProvider = process.env["ETH_NODE_MUMBAI"];

    if (hre.network.name == "mainnet") {
      network = "mainnet";
      version = "v1";
      parentProvider = process.env["ETH_NODE_MAINNET"];
      maticProvider = process.env["ETH_NODE_MATIC"];
    }

    const maticPOSClient = new MaticPOSClient({
      network: network,
      version: version,
      parentProvider: parentProvider,
      maticProvider: maticProvider
    });
    const exitCalldata = await maticPOSClient.exitERC20(txHash, {from: owner, encodeAbi: true});

    console.log(exitCalldata);
    // let tx = await Harvester.withdrawOnRoot(exitCalldata.data, { gasLimit: 1000000 });
    // console.log(`https://etherscan.io/tx/${tx.hash}`)

    // tx = await Harvester.transferToOwner(token, { gasLimit: 500000 });
    // console.log(`https://etherscan.io/tx/${tx.hash}`)

    let tx = await Harvester.withdrawAndTransferToOwner(exitCalldata.data, token, {gasLimit: 1500000});
    console.log(`https://etherscan.io/tx/${tx.hash}`);
  });

module.exports = {};
