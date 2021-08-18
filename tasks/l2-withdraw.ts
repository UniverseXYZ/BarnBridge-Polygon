import { task } from "hardhat/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { config } from "../utils/config";

task("l2-withdraw", "Withdraw funds from child chain")
  .addParam("token", "Token to withdraw")
  .setAction(async ({token}, hre) => {
    const {ethers, getNamedAccounts} = hre;
    if (hre.network.name != "matic" && hre.network.name != "mumbai") {
      console.log("wrong network");
      return;
    }
    const cfg = config(hre);
    const Harvester = (await ethers.getContract("PolygonTokenHarvester"));

    let tx = await Harvester.withdrawOnChild(token, {gasLimit: 1500000});
    console.log(`https://polygonscan.com/tx/${tx.hash}`);
  });

module.exports = {};
