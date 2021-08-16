import { expect } from "chai";

import hre, { deployments, ethers, getNamedAccounts, getUnnamedAccounts } from "hardhat";

import { setupUser, setupUsers } from "./helpers";
import { config } from "../utils/config";

const setup = deployments.createFixture(async ({
                                                 deployments,
                                                 getNamedAccounts,
                                                 getUnnamedAccounts,
                                                 ethers
                                               }, options) => {
  const cfg = config(hre);

  //await deployments.fixture(["PolygonCommunityVault"]);
  await deployments.fixture();

  const {owner} = await getNamedAccounts();

  const contracts = {
    RootDAO: (await ethers.getContract("PolygonDAORoot")),
    ChildDAO: (await ethers.getContract("PolygonDAOChildTest")),
    Token: (await ethers.getContractAt("IERC20", cfg.tokenAddress, owner)),
    ChildMockERC20MOK: (await ethers.getContract("ChildMockERC20MOK")),
    StateSender: (await ethers.getContractAt("IStateSender", cfg.stateSender, owner))
  };

  // These object allow you to write things like `users[0].Token.transfer(....)`
  const users = await setupUsers(await getUnnamedAccounts(), contracts);

  // setFxChildTunnel
  await contracts.RootDAO.setFxChildTunnel(contracts.ChildDAO.address);
  // setFxRootTunnel
  await contracts.ChildDAO.setFxRootTunnel(contracts.RootDAO.address);

  return {
    ...contracts,
    cfg,
    users,
    owner: await setupUser(owner, contracts)
  };
});

describe("Polygon DAO Root Chain Tests", () => {
  describe("Initialization tests", () => {
    it("Deployment should succeed and sane options should be set", async function () {
      const {Token, RootDAO, owner} = await setup();

      expect(await Token.balanceOf(RootDAO.address))
        .to.equal("0");

      expect(await RootDAO.owner()).to.be.equal(owner.address);

    });
  });

  describe("PolygonDAORoot Tests", function () {
    it("Should fail if random address tries to transferOwnership", async function () {
      const {users} = await setup();

      await expect(users[0].RootDAO.transferOwnership(users[0].address))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should transfer payload to bridge and execute it", async function () {
      const {RootDAO, ChildDAO, ChildMockERC20MOK, StateSender, owner, users} = await setup();

      const amount = "1000000000000000000000";
      await ChildMockERC20MOK.mint(ChildDAO.address, amount);
      expect(await ChildMockERC20MOK.balanceOf(ChildDAO.address))
        .to.equal(amount);

      // encode addr + sig + calldata
      const payload = ChildMockERC20MOK.interface.encodeFunctionData("transfer", [users[0].address, amount]);

      // transfer to/through the bridge
      await expect(RootDAO.callOnChild(ChildMockERC20MOK.address, 0, payload))
        .to.emit(StateSender, "StateSynced")
        .to.emit(RootDAO, "CallOnChild")
        .withArgs(owner.address, ChildMockERC20MOK.address, 0, "0xa9059cbb");

      const coder = new ethers.utils.AbiCoder();
      const encoded = coder.encode(["address", "uint256", "bytes"], [ChildMockERC20MOK.address, 0, payload]);

      // receive on child and execute
      await expect(ChildDAO.processMessageFromRootTest(0, RootDAO.address, encoded))
        .to.not.be.reverted;
    });

    it("Should transfer payload to bridge and send value on child", async function () {
      const {RootDAO, ChildDAO, ChildMockERC20MOK, StateSender, owner, users} = await setup();

      const accounts = await ethers.getSigners();
      await accounts[0].sendTransaction({
        to: ChildDAO.address,
        value: 10
      });

      const payload = "0x";

      // transfer to/through the bridge
      await expect(RootDAO.callOnChild(ChildMockERC20MOK.address, 10, payload))
        .to.emit(StateSender, "StateSynced")
        .to.emit(RootDAO, "CallOnChild")
        .withArgs(owner.address, ChildMockERC20MOK.address, 10, "0x00000000");

      const coder = new ethers.utils.AbiCoder();
      const encoded = coder.encode(["address", "uint256", "bytes"], [owner.address, 10, payload]);

      // receive on child and execute
      await expect(ChildDAO.processMessageFromRootTest(0, RootDAO.address, encoded))
        .to.not.be.reverted;

      // TODO check ether balance
    });
  });

});
