import { task } from "hardhat/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { config } from "../utils/config";

task("send-multi-to-goerli", "Sends multiple tokens to goerli from mumbai")
  .setAction(async (args, hre) => {
    const {ethers, getNamedAccounts} = hre;
    if (hre.network.name != "mumbai") {
      console.log("wrong network");
      return;
    }
    const cfg = config(hre);
    const {owner} = await getNamedAccounts();
    const Bond = (await ethers.getContractAt("ERC20Mock", cfg.tokenAddress, owner));
    const ChildVault = (await ethers.getContract("PolygonCommunityVault"));
    const Harvester = (await ethers.getContract("PolygonTokenHarvester"));

    // let tx = await Harvester.withdrawOnChildMulti([Bond.address], { gasLimit: 1500000 });
    let tx = await Harvester.withdrawOnChild(Bond.address, {gasLimit: 1500000});
    console.log(`https://explorer-mumbai.maticvigil.com/tx/${tx.hash}/token-transfers`);

    tx = await Harvester.withdrawOnChild("0xddb87d7b2741d0b77c84386072c63d270556b55b", {gasLimit: 1500000});
    console.log(`https://explorer-mumbai.maticvigil.com/tx/${tx.hash}/token-transfers`);

    tx = await Harvester.withdrawOnChild("0xdb8503b2df452fcbb10f3e63cec5880f8f73f302", {gasLimit: 1500000});
    console.log(`https://explorer-mumbai.maticvigil.com/tx/${tx.hash}/token-transfers`);
  });

module.exports = {};
