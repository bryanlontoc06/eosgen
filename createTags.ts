// Usage: node createTags.ts <branchTag> <tagVersion> <currentReleaseVersion>
// Example: node createTags.ts master 1.0.0-000 1.0.0-mb
//
// This script will create new tags for all microservices.
// It creates a new tag for each microservice based on the current release version and description.
// The script is useful when you need to create new tags for multiple microservices.
// It helps to ensure that the tags are consistent across all microservices.
// The script uses the current release version and description for each microservice.
// The script runs the following Git commands for each microservice:
// 1. git checkout <branchTag>
// 2. git pull origin <branchTag>
// 4. git tag v<tagVersion> -a -m "Bump version to <currentReleaseVersion>"
// 5. git push origin v<tagVersion>
// 6. git tag -n

(() => {
  const { execSync } = require("child_process");
  const fs = require("fs");
  const path = require("path");
  const readline = require("readline");

  // List of microservices to update
  const microservices = [
    // "falcon-web-bff",
    // "falcon-app-bff",
    // "falcon-connect-svc",
    // "falcon-product-svc",
    // "falcon-store-svc",
    // "falcon-order-svc",
    // "falcon-payment-svc",
    // "falcon-discount-svc",
    // "falcon-cart-svc",
    // "falcon-notification-svc",
    // "falcon-user-svc",
    // "falcon-webhook-svc",
    // "falcon-jedi-svc",
    "falcon-promo-svc",
    // "falcon-console-bff",
  ];

  function runCommand(command, cwd) {
    try {
      console.log(`🚀 Running in ${cwd}: ${command}`);
      execSync(command, { stdio: "inherit", cwd }); // Run command in the microservice directory
    } catch (error) {
      console.error(`❌ Error executing in ${cwd}: ${command}`);
      process.exit(1);
    }
  }

  // Function to get user confirmation
  // function getUserConfirmation(question) {
  //   return new Promise((resolve) => {
  //     const rl = readline.createInterface({
  //       input: process.stdin,
  //       output: process.stdout,
  //     });

  //     rl.question(`${question} (y/n): `, (answer) => {
  //       rl.close();
  //       resolve(answer.toLowerCase() === "y");
  //     });
  //   });
  // }

  // Get dynamic values from command-line arguments
  const branchTag = process.argv[2]; // e.g., "master"
  const tagVersion = process.argv[3]; // e.g., "1.0.0-000"
  const currentReleaseVersion = process.argv[4]; // e.g., "1.0.0-mb"
  if (!currentReleaseVersion || !tagVersion || !branchTag) {
    console.error(
      "❌ Usage: node createTags.ts <branchTag> <tagVersion> <currentReleaseVersion>"
    );
    process.exit(1);
  }

  // Run Git commands for each microservice
  (async () => {
    for (const service of microservices) {
      const servicePath = path.join(__dirname, "..", service); // Adjust path if needed
      if (!fs.existsSync(servicePath)) {
        console.warn(
          `⚠️ Skipping ${service}: Directory not found at ${servicePath}`
        );
        continue;
      }

      console.log(`🔹 CREATE TAGS MANAGEMENT 🔹`);
      console.log(`🔹 Processing microservice: ${service}`);

      // ========================= Commands ========================= //
      // 1️⃣ Checkout branchTag and pull latest changes
      runCommand(`git checkout ${branchTag}`, servicePath);
      runCommand(`git pull origin ${branchTag}`, servicePath);

      // 2️⃣ Create tag for the current release branch
      runCommand(
        `git tag v${tagVersion} -a -m "Bump version to ${currentReleaseVersion}"`,
        servicePath
      );

      // 3️⃣ Push the tag to the remote repository
      // runCommand(`git push origin v${tagVersion}`, servicePath);

      // ========================= Commands ========================= //

      console.log(
        `✅ Created New Tags for ${currentReleaseVersion} completed in ${service}`
      );

      // // Ask user before pushing
      // const confirmPush = await getUserConfirmation(
      //   `Do you want to push ${choreBranch} for ${service}?`
      // );
      // if (confirmPush) {
      //   runCommand(`git push origin ${choreBranch}`, servicePath);
      //   console.log(`🚀 Pushed ${choreBranch} to remote repository.`);
      // } else {
      //   console.log(`❌ Skipped pushing ${choreBranch}`);
      // }

      console.log(`✅ Completed process for ${service}\n`);
    }

    console.log(
      "🎉 You may now push all microservices tags on the REMOTE BRANCH! 🎉"
    );
  })();
})();
