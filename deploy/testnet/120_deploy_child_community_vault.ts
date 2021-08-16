import { DeployFunction } from "hardhat-deploy/types";
import { config } from "../../utils/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploymentName = "ChildPolygonCommunityVault";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const {deployments, getNamedAccounts, ethers} = hre;
  const {deploy, execute, deterministic} = deployments;
  const cfg = config(hre);

  const {owner} = await getNamedAccounts();

  console.log("deploy-testnet:", deploymentName);

  // change salt to force new deployment without code changes
  const seed = cfg.seed + "vault" + "-test-child" ;
  const salt = ethers.utils.sha256(ethers.utils.toUtf8Bytes(seed));

  const deployer = await deterministic(deploymentName, {
    contract: 'PolygonCommunityVault',
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
      "initialize", cfg.tokenAddress, ethers.constants.AddressZero, ethers.constants.AddressZero,
    );
    console.log(`executed initialize (tx: ${txResult.transactionHash}) with status ${txResult.status}`);
  }
};

export default func;

func.tags = [deploymentName];
