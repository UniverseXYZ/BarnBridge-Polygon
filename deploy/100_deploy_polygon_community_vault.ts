import { DeployFunction } from "hardhat-deploy/types";
import { config } from "../utils/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const {deployments, getNamedAccounts, ethers} = hre;
  const {deploy, execute, deterministic} = deployments;
  const cfg = config(hre);

  const {owner} = await getNamedAccounts();

  // change salt to force new deployment without code changes
  const seed = "dev01";
  const salt = ethers.utils.sha256(ethers.utils.toUtf8Bytes(seed));

  const deployer = await deterministic("PolygonCommunityVault", {
    from: owner,
    args: [],
    log: true,
    salt: salt,
  });

  const deployResult = await deployer.deploy()

  if (deployResult.newlyDeployed) {
    const txResult = await execute(
      "PolygonCommunityVault",
      {from: owner},
      "initialize", cfg.bondAddress, cfg.rootChainManager, cfg.erc20Predicate,
    );
    console.log(`executed initialize (tx: ${txResult.transactionHash}) with status ${txResult.status}`);
  }
};

export default func;

func.tags = ["PolygonCommunityVault"];
