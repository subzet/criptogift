import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const CrowfundContract = await ethers.getContractFactory("Crowfund");
  const crowfund = await CrowfundContract.deploy();

  await crowfund.deployed();

  console.log(`CriptoGift deployed to ${crowfund.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
