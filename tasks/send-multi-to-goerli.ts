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
    const MOK = (await ethers.getContractAt("ERC20Mock", "0xddb87d7b2741d0b77c84386072c63d270556b55b", owner));
    const MCK = (await ethers.getContractAt("ERC20Mock", "0xdb8503b2df452fcbb10f3e63cec5880f8f73f302", owner));
    const Harvester = (await ethers.getContract("PolygonTokenHarvester"));

    let tx = await Harvester.withdrawOnChild(MOK.address, {gasLimit: 1500000});
    console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`);

    tx = await Harvester.withdrawOnChild(MCK.address, {gasLimit: 1500000});
    console.log(`https://mumbai.polygonscan.com/tx/${tx.hash}`);
  });

module.exports = {};
