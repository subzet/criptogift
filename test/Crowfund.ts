import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { expect } from "chai";
import { ethers } from "hardhat";

const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;

describe("Crowfund", function () {
  async function deployCrowfund() {
    const Crowfund = await ethers.getContractFactory("Crowfund");

    const [owner, otherAccount, anotherAccount] = await ethers.getSigners();

    const crowfund = await Crowfund.deploy();

    return { crowfund, owner, otherAccount, anotherAccount };
  }

  describe("Project", function () {
    it("Should create project correctly", async function () {
      //Deploy
      const { crowfund, otherAccount, owner } = await loadFixture(
        deployCrowfund
      );

      //Get last block timestamp
      const deadline = (await time.latest()) + ONE_YEAR_IN_SECS;

      //Create a project
      await crowfund.createProject(deadline, otherAccount.address);

      //Get project
      const project = await crowfund.getProject(otherAccount.address);

      expect(project[0]).to.equal(deadline);
      expect(project[1]).to.equal(true);
      expect(project[2]).to.equal(owner.address);
    });

    it("Should create and delete a project correctly", async function () {
      //Deploy
      const { crowfund, otherAccount } = await loadFixture(deployCrowfund);

      const deadline = (await time.latest()) + 5;

      //Create a project
      await crowfund.createProject(deadline, otherAccount.address);

      //Delete project
      await crowfund.deleteProject(otherAccount.address);

      await expect(
        crowfund.getProject(otherAccount.address)
      ).to.be.revertedWith("Project does not exists");
    });

    it("Should create & avoid creating another project for same address", async function () {
      //Deploy
      const { crowfund, owner, otherAccount } = await loadFixture(
        deployCrowfund
      );

      const deadline = (await time.latest()) + ONE_YEAR_IN_SECS;

      //Create a project
      await crowfund.createProject(deadline, otherAccount.address);

      //Create project again
      await expect(
        crowfund.createProject(deadline, otherAccount.address)
      ).to.be.revertedWith("Project already exists");
    });

    it("Should create & contribute to a project", async function () {
      //Deploy
      const { crowfund, owner, otherAccount } = await loadFixture(
        deployCrowfund
      );

      const deadline = (await time.latest()) + ONE_YEAR_IN_SECS;

      //Create a project
      await crowfund.createProject(deadline, otherAccount.address);

      //Set value
      const ethAmount = "0.00001";
      const weiAmount = ethers.utils.parseEther(ethAmount);
      const transaction = {
        value: weiAmount,
      };

      await crowfund.contribute(otherAccount.address, transaction);

      const amountContributed = await crowfund.getTotalAmountContributed(
        otherAccount.address
      );

      expect(amountContributed).to.equal(weiAmount);
    });

    it("Should create & contribute multiple times to a project", async function () {
      //Deploy
      const { crowfund, otherAccount, anotherAccount } = await loadFixture(
        deployCrowfund
      );

      const deadline = (await time.latest()) + ONE_YEAR_IN_SECS;

      //Create a project
      await crowfund.createProject(deadline, otherAccount.address);

      //Set value
      const ethAmount = "0.00001";
      const weiAmount = ethers.utils.parseEther(ethAmount);
      const transaction = {
        value: weiAmount,
      };

      await crowfund.contribute(otherAccount.address, transaction);

      await crowfund
        .connect(anotherAccount)
        .contribute(otherAccount.address, { ...transaction });

      const amountContributed = await crowfund.getTotalAmountContributed(
        otherAccount.address
      );

      expect(amountContributed).to.equal(weiAmount.mul(2));
    });

    it("Should create, contribute multiple times to a project & claim value", async function () {
      //Deploy
      const { crowfund, owner, otherAccount, anotherAccount } =
        await loadFixture(deployCrowfund);

      const deadline = (await time.latest()) + 500;

      //Create a project
      await crowfund.createProject(deadline, otherAccount.address);

      //Set value
      const ethAmount = "0.001";
      const weiAmount = ethers.utils.parseEther(ethAmount);
      const transaction = {
        value: weiAmount,
      };

      await crowfund.contribute(otherAccount.address, transaction);

      await crowfund
        .connect(anotherAccount)
        .contribute(otherAccount.address, { ...transaction });

      const amountContributed = await crowfund.getTotalAmountContributed(
        otherAccount.address
      );

      const beforeBalance = await otherAccount.getBalance();

      await time.increase(3600);

      await crowfund.connect(otherAccount).claim();

      const afterBalance = await otherAccount.getBalance();

      expect(amountContributed).to.equal(weiAmount.mul(2));
      expect(afterBalance).to.be.greaterThan(beforeBalance);
    });
  });
});
