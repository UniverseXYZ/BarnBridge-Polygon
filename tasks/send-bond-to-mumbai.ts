import { task } from "hardhat/config";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import { config } from "../utils/config";

task("send-bond-to-mumbai", "Sends bond to mumbai from goerli")
  .addParam("amount", "How much to send")
  .setAction(async ({amount}, hre) => {
    const {ethers, deployments, getNamedAccounts, getUnnamedAccounts} = hre;
    if (hre.network.name != "goerli") {
      console.log("wrong network");
      return;
    }
    const cfg = config(hre);
    const {owner} = await getNamedAccounts();
    const Bond = (await ethers.getContractAt("ERC20Mock", cfg.tokenAddress, owner));
    const RootVault = (await ethers.getContract("PolygonCommunityVault"));

    const mintAmount = ethers.utils.parseUnits(amount, 18);
    let tx = await Bond.mint(RootVault.address, mintAmount, {gasLimit: 500000});
    console.log(`https://goerli.etherscan.io/tx/${tx.hash} (${tx.nonce})`);

    tx = await RootVault.transferToChild({gasLimit: 500000});
    console.log(`https://goerli.etherscan.io/tx/${tx.hash} (${tx.nonce})`);
  });

module.exports = {};
