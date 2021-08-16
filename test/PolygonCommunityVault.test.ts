import { expect } from "chai";

import hre, { ethers, deployments, getNamedAccounts, getUnnamedAccounts } from "hardhat";

import { setupUsers, setupUser } from "./helpers";
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
    RootVault: (await ethers.getContract("PolygonCommunityVault")),
    ChildVault: (await ethers.getContract("ChildPolygonCommunityVault")),
    Token: (await ethers.getContractAt("IERC20", cfg.tokenAddress, owner)),
    ERC20Predicate: (await ethers.getContractAt("IERC20Predicate", cfg.erc20Predicate, owner)),
    StateSender: (await ethers.getContractAt("IStateSender", cfg.stateSender, owner))
  };

  // These object allow you to write things like `users[0].Token.transfer(....)`
  const users = await setupUsers(await getUnnamedAccounts(), contracts);

  // TODO get the proper interface and use mint instead of transfer
  await contracts.Token.transfer(contracts.RootVault.address, "1000000000000000000000").then((tx: { wait: () => any; }) => tx.wait());

  await contracts.Token.transfer(contracts.ChildVault.address, "1000000000000000000000").then((tx: { wait: () => any; }) => tx.wait());

  return {
    ...contracts,
    users,
    owner: await setupUser(owner, contracts)
  };
});

describe("Vault Root Chain Tests", () => {
  describe("Initialization Tests", () => {
    it("Deployment should succeed and 1000 tokens should be in vault", async function () {
      const {Token, RootVault} = await setup();

      expect(await Token.balanceOf(RootVault.address))
        .to.equal("1000000000000000000000");

      expect(await RootVault.token()).to.equal(Token.address);
    });
  });

  describe("Vault Tests", function () {
    it("Should fail if random address tries to setAllowance", async function () {
      const {owner, users} = await setup();

      await expect(users[0].RootVault.setAllowance(owner.address, "1")).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should fail if random address tries to transferOwnership", async function () {
      const {users} = await setup();

      await expect(users[0].RootVault.transferOwnership(users[0].address)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should transferOwnership", async function () {
      const {RootVault, owner, users} = await setup();

      expect(await RootVault.owner()).to.be.equal(owner.address);

      await expect(owner.RootVault.transferOwnership(users[0].address))
        .to.emit(RootVault, "OwnershipTransferred");

      expect(await RootVault.owner()).to.be.equal(users[0].address);
    });
  });

  describe("Events", () => {
    it("setAllowance works for owner and emits SetAllowance", async function () {
      const {RootVault, owner, users} = await setup();

      await expect(owner.RootVault.setAllowance(owner.address, "1000000000000000000000"))
        .to.emit(RootVault, "SetAllowance");
    });
  });

  describe("transferToChild tests", () => {
    it("Should transfer all tokens to Child Chain as owner", async function () {
      const {Token, RootVault, ERC20Predicate, StateSender, owner} = await setup();
      const value = "1000000000000000000000";

      expect(await Token.balanceOf(RootVault.address))
        .to.equal(value);

      await expect(owner.RootVault.transferToChild())
        .to.emit(Token, "Approval")
        .to.emit(ERC20Predicate, "LockedERC20").withArgs(RootVault.address, RootVault.address, Token.address, value)
        .to.emit(Token, "Transfer").withArgs(RootVault.address, ERC20Predicate.address, value)
        .to.emit(StateSender, "StateSynced")
        .to.emit(RootVault, "TransferToChild").withArgs(owner.address, Token.address, value);

      expect(await Token.balanceOf(RootVault.address))
        .to.equal("0");

    });

    it("Should transfer all tokens to Child as anyone", async function () {
      const {Token, RootVault, ERC20Predicate, StateSender, users} = await setup();
      const value = "1000000000000000000000";

      expect(await Token.balanceOf(RootVault.address))
        .to.equal(value);

      await expect(users[0].RootVault.transferToChild())
        .to.emit(Token, "Approval")
        .to.emit(ERC20Predicate, "LockedERC20").withArgs(RootVault.address, RootVault.address, Token.address, value)
        .to.emit(Token, "Transfer").withArgs(RootVault.address, ERC20Predicate.address, value)
        .to.emit(StateSender, "StateSynced")
        .to.emit(RootVault, "TransferToChild").withArgs(users[0].address, Token.address, value);

      expect(await Token.balanceOf(RootVault.address))
        .to.equal("0");

    });
  });
});

describe("Vault Child Chain tests", () => {
  describe("Initialization tests", () => {
    it("Deployment should succeed and 1000 tokens should be in vault", async function () {
      const {Token, ChildVault} = await setup();

      const vaultBalance = await Token.balanceOf(ChildVault.address);

      expect(vaultBalance)
        .to.equal("1000000000000000000000");
    });
  });

  describe("Vault Tests", function () {
    it("Should fail if no owner tries to set allowance", async function () {
      const {owner, users} = await setup();

      await expect(users[0].ChildVault.setAllowance(owner.address, "1")).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should transferOwnership", async function () {
      const {ChildVault, owner, users} = await setup();

      expect(await ChildVault.owner()).to.be.equal(owner.address);

      await expect(owner.ChildVault.transferOwnership(users[0].address))
        .to.emit(ChildVault, "OwnershipTransferred");

      expect(await ChildVault.owner()).to.be.equal(users[0].address);
    });
  });

  describe("Events", () => {
    it("setAllowance works for owner and emits SetAllowance", async function () {
      const {ChildVault, owner} = await setup();

      await expect(owner.ChildVault.setAllowance(owner.address, "1000000000000000000000"))
        .to.emit(ChildVault, "SetAllowance");
    });
  });

  describe("Transfer to Child Chain Tests", () => {
    it("transferToChild should revert", async function () {
      const {Token, ChildVault, owner} = await setup();
      const value = "1000000000000000000000";

      expect(await Token.balanceOf(ChildVault.address))
        .to.equal(value);

      await expect(owner.ChildVault.transferToChild())
        .to.be.revertedWith("Vault: transfer to child chain is disabled");

      expect(await Token.balanceOf(ChildVault.address))
        .to.equal(value);

    });
  });

});
