import { HardhatUserConfig, task } from 'hardhat/config';
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { config } from "../utils/config";

task("send-bond-to-goerli", "Sends bond to goerli from mumbai")
    .setAction(async (args, hre) => {
        const { ethers, deployments, getNamedAccounts, getUnnamedAccounts } = hre;
        if (hre.network.name != "mumbai") {
            console.log("wrong network");
            return;
        }
        const cfg = config(hre);
        const { owner } = await getNamedAccounts();
        const Bond = (await ethers.getContractAt("ERC20Mock", cfg.tokenAddress, owner));
        const ChildVault = (await ethers.getContract("PolygonCommunityVault"));
        const Harvester = (await ethers.getContract("PolygonTokenHarvester"));

        await ChildVault.setAllowance(owner, ethers.constants.MaxUint256, { gasLimit: 500000 });
        const balance = await Bond.balanceOf(ChildVault.address);
        console.log("BOND to transfer", ethers.utils.formatUnits(balance, 18))
        await Bond.transferFrom(ChildVault.address, Harvester.address, balance)
        let tx = await Harvester.withdrawOnChild(Bond.address, { gasLimit: 500000 });
        console.log(`https://explorer-mumbai.maticvigil.com/tx/${tx.hash}/token-transfers`)
    });

module.exports = {};
