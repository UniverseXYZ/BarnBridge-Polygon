import { DeployFunction } from "hardhat-deploy/types";
import { config } from "../../utils/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploymentName = "PolygonCommunityVault";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const {deployments, getNamedAccounts, ethers} = hre;
  const {deploy, execute, deterministic} = deployments;
  const cfg = config(hre);

  const {owner} = await getNamedAccounts();

  console.log("deploy:", deploymentName);

  // change salt to force new deployment without code changes
  const seed = cfg.seed + "vault";
  const salt = ethers.utils.sha256(ethers.utils.toUtf8Bytes(seed));

  const deployer = await deterministic(deploymentName, {
    from: owner,
    args: [],
    log: true,
    salt: salt,
  });

  const deployResult = await deployer.deploy()

  if (deployResult.newlyDeployed) {
    const txResult = await execute(
      deploymentName,
      {from: owner},
      "initialize", cfg.tokenAddress, cfg.rootChainManager, cfg.erc20Predicate,
    );
    console.log(`executed initialize (tx: ${txResult.transactionHash}) with status ${txResult.status}`);
  }
};

export default func;

func.tags = [deploymentName];
