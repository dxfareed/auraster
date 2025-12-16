const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const auraster = await hre.ethers.deployContract("Auraster");

    await auraster.waitForDeployment();

    console.log("Auraster deployed to:", await auraster.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
