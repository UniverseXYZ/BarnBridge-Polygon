import { task } from "hardhat/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { config } from "../utils/config";

task("send-usdc-from-sy-to-goerli", "Sends bond to smart yield provider then claims and withdraws")
  .setAction(async (args, hre) => {
    const {ethers, deployments, getNamedAccounts, getUnnamedAccounts} = hre;
    if (hre.network.name != "mumbai") {
      console.log("wrong network");
      return;
    }
    const cfg = config(hre);
    const {owner} = await getNamedAccounts();
    const Bond = (await ethers.getContractAt("ERC20Mock", cfg.tokenAddress, owner));
    const ChildVault = (await ethers.getContract("PolygonCommunityVault"));
    const Harvester = (await ethers.getContract("PolygonTokenHarvester"));
    const SYProvider = (await ethers.getContractAt("ISmartYieldProvider", "0x63fD30ed07c91B7b27Da5c828c7eB752F7e4676b"));

    // await ChildVault.setAllowance(owner, ethers.constants.MaxUint256, {gasLimit: 500000});
    // // const balance = await Bond.balanceOf(ChildVault.address);
    // const balance = "20000000000000000000";
    // console.log("BOND to transfer", ethers.utils.formatUnits(balance, 18));
    // let tx = await Bond.transferFrom(ChildVault.address, SYProvider.address, balance);
    // console.log(`https://explorer-mumbai.maticvigil.com/tx/${tx.hash}/token-transfers`);

    let tx = await Harvester.claimAndWithdrawOnChild(SYProvider.address, {gasLimit: 500000});
    console.log(`https://explorer-mumbai.maticvigil.com/tx/${tx.hash}/token-transfers`);
  });

module.exports = {};
