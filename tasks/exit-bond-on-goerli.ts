import { HardhatUserConfig, task } from 'hardhat/config';
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { MaticPOSClient } from '@maticnetwork/maticjs';
import { config } from "../utils/config";

task("exit-bond-on-goerli", "Sends bond to mumbai from goerli")
    .addParam("txHash", "Burn tx hash")
    .setAction(async ({ txHash }, hre) => {
        const { ethers, deployments, getNamedAccounts, getUnnamedAccounts } = hre;
        if (hre.network.name != "goerli") {
            console.log("wrong network");
            return;
        }
        const cfg = config(hre);
        const { owner } = await getNamedAccounts();
        const Harvester = (await ethers.getContract("PolygonTokenHarvester"));

        // const Bond = (await ethers.getContractAt("ERC20Mock", cfg.bondAddress, owner));
        // const RootVault = (await ethers.getContract("PolygonCommunityVault"))

        const maticPOSClient = new MaticPOSClient({
            network: "testnet",
            version: "mumbai",
            parentProvider: process.env["ETH_NODE_GOERLI"],
            maticProvider: process.env["ETH_NODE_MUMBAI"]
          });
        const exitCalldata = await maticPOSClient.exitERC20(txHash, { from: owner, encodeAbi: true });

        let tx = await Harvester.withdrawOnRoot(exitCalldata.data, { gasLimit: 1000000 });
        console.log(`https://goerli.etherscan.io/tx/${tx.hash}`)

        tx = await Harvester.transferToOwner(cfg.tokenAddress, { gasLimit: 500000 });
        console.log(`https://goerli.etherscan.io/tx/${tx.hash}`)

    });

module.exports = {};
