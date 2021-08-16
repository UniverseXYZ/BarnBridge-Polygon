import { expect } from "chai";

import hre, { deployments, ethers, getNamedAccounts, getUnnamedAccounts } from "hardhat";

import { setupUser, setupUsers } from "./helpers";
import { config } from "../utils/config";
import { mineBlocks } from "./helpers/time";

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
    RootHarvester: (await ethers.getContract("RootPolygonTokenHarvesterTest")),
    ChildHarvester: (await ethers.getContract("ChildPolygonTokenHarvesterTest")),
    Token: (await ethers.getContractAt("IERC20", cfg.tokenAddress, owner)),
    MockRootChainManager: (await ethers.getContract("MockRootChainManager")),
    ChildMockERC20MOK: (await ethers.getContract("ChildMockERC20MOK")),
    ChildMockERC20MCK: (await ethers.getContract("ChildMockERC20MCK")),
  };

  // These object allow you to write things like `users[0].Token.transfer(....)`
  const users = await setupUsers(await getUnnamedAccounts(), contracts);

  return {
    ...contracts,
    cfg,
    users,
    owner: await setupUser(owner, contracts)
  };
});

describe("Harvester Root Chain Tests", () => {
  describe("Initialization tests", () => {
    it("Deployment should succeed and sane options should be set", async function () {
      const {Token, RootHarvester, MockRootChainManager, owner} = await setup();

      expect(await Token.balanceOf(RootHarvester.address))
        .to.equal("0");

      expect(await RootHarvester.owner()).to.be.equal(owner.address);

      expect(await RootHarvester.rootChainManager()).to.be.equal(MockRootChainManager.address);
    });
  });

  describe("Harvester Tests", function () {
    it("Should fail if random address tries to transferOwnership", async function () {
      const {users} = await setup();

      await expect(users[0].RootHarvester.transferOwnership(users[0].address))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should transferOwnership", async function () {
      const {RootHarvester, owner, users} = await setup();

      expect(await RootHarvester.owner()).to.be.equal(owner.address);

      await expect(owner.RootHarvester.transferOwnership(users[0].address))
        .to.emit(RootHarvester, "OwnershipTransferred");

      expect(await RootHarvester.owner()).to.be.equal(users[0].address);
    });
  });

  describe("Root Chain Token Tests", () => {
    it("Should allow any user to exit and transfer tokens to owner", async function () {
      const {Token, RootHarvester, owner, users} = await setup();
      const value = "1000000000000000000000";

      expect(await Token.balanceOf(RootHarvester.address))
        .to.equal("0");

      await expect(users[0].RootHarvester.withdrawOnRoot("0x3805550f000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000"))
        .to.emit(RootHarvester, "WithdrawOnRoot").withArgs(users[0].address);

      // transfer some funds manually to the Harvester
      const beforeBalance = await Token.balanceOf(owner.address);
      await owner.Token.transfer(RootHarvester.address, value).then((tx: { wait: () => any; }) => tx.wait());

      expect(await Token.balanceOf(RootHarvester.address))
        .to.equal(value);

      await expect(users[0].RootHarvester.transferToOwner(Token.address))
        .to.emit(RootHarvester, "TransferToOwner")
        .withArgs(users[0].address, owner.address, Token.address, value)
        .to.emit(Token, "Transfer")
        .withArgs(RootHarvester.address, owner.address, value);

      expect(await Token.balanceOf(RootHarvester.address))
        .to.equal("0");

      expect(await Token.balanceOf(owner.address))
        .to.equal(beforeBalance);
    });

    it("Should allow any user to withdrawAndTransferToOwner", async function () {
      const {Token, RootHarvester, owner, users} = await setup();
      const value = "1000000000000000000000";

      // transfer some funds manually to the Harvester
      const beforeBalance = await Token.balanceOf(owner.address);
      await owner.Token.transfer(RootHarvester.address, value).then((tx: { wait: () => any; }) => tx.wait());

      expect(await Token.balanceOf(RootHarvester.address))
        .to.equal(value);

      await expect(users[0].RootHarvester.withdrawAndTransferToOwner(
        "0x3805550f000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000",
        Token.address
      ))
        .to.emit(RootHarvester, "WithdrawOnRoot").withArgs(users[0].address)
        .to.emit(RootHarvester, "TransferToOwner")
        .withArgs(users[0].address, owner.address, Token.address, value)
        .to.emit(Token, "Transfer")
        .withArgs(RootHarvester.address, owner.address, value);

      expect(await Token.balanceOf(RootHarvester.address))
        .to.equal("0");

      expect(await Token.balanceOf(owner.address))
        .to.equal(beforeBalance);
    });
  });

  describe("Failing Child Function on Root Chain Tests", () => {
    it("Should fail calling child only functions on root chain", async function () {
      const {Token, users} = await setup();

      await expect(users[0].RootHarvester.withdrawOnChild(Token.address)).to.be.revertedWith(
        "Harvester: should only be called on child chain"
      );

      await expect(users[0].RootHarvester.withdrawOnChild(Token.address)).to.be.revertedWith(
        "Harvester: should only be called on child chain"
      );
    });
  });
});

describe("Child Chain Tests", () => {
  describe("Initialization Tests", () => {
    it("Deployment should succeed and sane options should be set", async function () {
      const {Token, ChildHarvester, owner} = await setup();

      expect(await Token.balanceOf(ChildHarvester.address))
        .to.equal("0");

      expect(await ChildHarvester.owner()).to.be.equal(owner.address);

      expect(await ChildHarvester.rootChainManager()).to.be.equal(ethers.constants.AddressZero);
    });
  });

  describe("Getters and Setters Tests", () => {
    it("withdrawCooldown", async function () {
      const {ChildHarvester, cfg, owner, users} = await setup();

      expect(await ChildHarvester.withdrawCooldown())
        .to.be.equal(cfg.withdrawCooldown);

      const newCooldown = 4;

      await owner.ChildHarvester.setWithdrawCooldown(newCooldown);
      expect(await ChildHarvester.withdrawCooldown())
        .to.be.equal(newCooldown);

      await expect(users[0].ChildHarvester.setWithdrawCooldown(newCooldown))
        .to.be.revertedWith("Ownable: caller is not the owner");

      await expect(owner.ChildHarvester.setWithdrawCooldown(-1))
        .to.be.reverted;
    });
  });

  describe("Withdrawal Tests", () => {
    it("withdrawOnChild", async function () {
      const {ChildHarvester, ChildMockERC20MOK, cfg, users} = await setup();

      // add some token to harvester
      const amount = "1000000000000000000001";
      await ChildMockERC20MOK.mint(ChildHarvester.address, amount);
      expect(await ChildMockERC20MOK.balanceOf(ChildHarvester.address))
        .to.equal(amount);

      await expect(users[0].ChildHarvester.withdrawOnChild(ChildMockERC20MOK.address))
        .to.emit(ChildHarvester, "WithdrawOnChild")
        .withArgs(users[0].address, ChildMockERC20MOK.address, amount);

      expect(await ChildMockERC20MOK.balanceOf(ChildHarvester.address))
        .to.equal("0");

      // add some more tokens
      await ChildMockERC20MOK.mint(ChildHarvester.address, amount);
      expect(await ChildMockERC20MOK.balanceOf(ChildHarvester.address))
        .to.equal(amount);

      // expect another withdrawal to be skipped and balance to remain the same
      await expect(users[0].ChildHarvester.withdrawOnChild(ChildMockERC20MOK.address))
        .to.not.be.reverted;
      expect(await ChildMockERC20MOK.balanceOf(ChildHarvester.address))
        .to.equal(amount);

      await mineBlocks(cfg.withdrawCooldown);
      await expect(users[0].ChildHarvester.withdrawOnChild(ChildMockERC20MOK.address))
        .to.emit(ChildHarvester, "WithdrawOnChild")
        .withArgs(users[0].address, ChildMockERC20MOK.address, amount);

      expect(await ChildMockERC20MOK.balanceOf(ChildHarvester.address))
        .to.equal(0);
    });
  });

  describe("Failing Root Functions on Child Chain Tests", () => {
    it("Should fail withdrawOnRoot", async function () {
      const {users} = await setup();

      await expect(users[0].ChildHarvester.withdrawOnRoot("0x00"))
        .to.be.revertedWith("Harvester: should only be called on root chain");
    });
  });
});
