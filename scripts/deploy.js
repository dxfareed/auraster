import hre from "hardhat";

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy with the deployer as the initial signer
    const auraster = await hre.ethers.deployContract("Auraster", [deployer.address]);

    await auraster.waitForDeployment();

    const address = await auraster.getAddress();
    console.log("Auraster deployed to:", address);

    console.log("Waiting for block confirmations...");
    // Wait 5 confirmations to ensure propagation before verification
    await auraster.deploymentTransaction().wait(5);

    console.log("Verifying contract...");
    try {
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: [deployer.address],
        });
    } catch (e) {
        console.log("Verification failed:", e);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
