const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ERC20Token", function () {
  async function deployERC20Token() {
    const [signer, ...other] = await ethers.getSigners();

    const token = await ethers.deployContract("ERC20", ["Token", "TKN"]);
    await token.waitForDeployment();

    const myToken = await ethers.deployContract("ERC20Token", [
      "MyToken",
      "MTKN",
      signer.address,
    ]);
    await myToken.waitForDeployment();

    return { token, myToken, signer, other };
  }

  describe("Deployment", function () {
    it("Should set the right metadata", async function () {
      const { myToken } = await loadFixture(deployERC20Token);
      const name = "MyToken";
      const symbol = "MTKN";

      expect(await myToken.name()).to.equal(name);
      expect(await myToken.symbol()).to.equal(symbol);
    });

    it("Should set the right owner", async function () {
      const { myToken, signer } = await loadFixture(deployERC20Token);

      expect(await myToken.owner()).to.equal(signer.address);
    });
  });

  describe("Minting", function () {
    it("Should mint the proper amount of tokens", async function () {
      const { myToken, signer } = await loadFixture(deployERC20Token);
      const value = ethers.parseEther("1");

      await myToken.connect(signer).mint(signer.address, value);
      expect(await myToken.totalSupply()).to.equal(value);
      expect(await myToken.balanceOf(signer.address)).to.equal(value);
    });

    it("Should emit an event", async function () {
      const { myToken, signer, other } = await loadFixture(deployERC20Token);
      const value = ethers.parseEther("1");

      expect(await myToken.connect(signer).mint(signer.address, value))
        .to.emit("ERC20TokenMinted")
        .withArgs([signer.address, value]);
      expect(await myToken.balanceOf(signer.address)).to.equal(value);
    });
  });

  describe("Burning", function () {
    it("Should burn the proper amount of tokens", async function () {
      const { myToken, signer } = await loadFixture(deployERC20Token);
      const value = ethers.parseEther("1");

      await myToken.connect(signer).mint(signer.address, value);
      await myToken.connect(signer).burn(signer.address, value);
      expect(await myToken.totalSupply()).to.equal(0);
      expect(await myToken.balanceOf(signer.address)).to.equal(0);
    });

    it("Should emit an event", async function () {
      const { myToken, signer } = await loadFixture(deployERC20Token);
      const value = ethers.parseEther("1");

      await myToken.connect(signer).mint(signer.address, value);
      expect(await myToken.burn(signer.address, value))
        .to.emit("ERC20TokenMinted")
        .withArgs([signer.address, value]);
    });
  });
});
