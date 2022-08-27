import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

const ONE_GWEI = 1_000_000_000;
const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;

describe("Crowfund", function () {
  async function deployCrowfund() {
    const Crowfund = await ethers.getContractFactory("Crowfund");

    const [owner, otherAccount] = await ethers.getSigners();

    const crowfund = await Crowfund.deploy();

    return { crowfund, owner, otherAccount };
  }

  describe("Project", function () {
    it("Should create project correctly", async function () {
      //Deploy
      const { crowfund, otherAccount, owner } = await loadFixture(
        deployCrowfund
      );

      //Create a project
      await crowfund.createProject(
        ONE_YEAR_IN_SECS,
        ONE_GWEI,
        otherAccount.address
      );

      //Get project
      const project = await crowfund.getProject(otherAccount.address);

      expect(project[0]).to.equal(ONE_YEAR_IN_SECS);
      expect(project[1]).to.equal(ONE_GWEI);
      expect(project[2]).to.equal(true);
      expect(project[3]).to.equal(owner.address);
    });

    it("Should create and delete a project correctly", async function () {
      //Deploy
      const { crowfund, otherAccount } = await loadFixture(deployCrowfund);

      //Create a project
      await crowfund.createProject(
        ONE_YEAR_IN_SECS,
        ONE_GWEI,
        otherAccount.address
      );

      //Delete project
      await crowfund.deleteProject(otherAccount.address);

      await expect(
        crowfund.getProject(otherAccount.address)
      ).to.be.revertedWith("Project does not exists");
    });
  });
});
