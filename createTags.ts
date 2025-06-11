// Usage: node createTags.ts <release-version(current)> <high level description of the changes>
// Example: node createTags.ts 1.0.0-mb "Bump version to 1.0.0-mb"
//
// This script will create new tags for all microservices.
// It creates a new tag for each microservice based on the current release version and description.
// The script is useful when you need to create new tags for multiple microservices.
// It helps to ensure that the tags are consistent across all microservices.
// The script uses the current release version and description for each microservice.
// The script runs the following Git commands for each microservice:
// 1. git checkout master
// 2. git pull origin master
// 3. git checkout -b <release-version(current)>
// 4. git tag v1.0.0-mb -a -m "<high level description of the changes>"
// 5. git push origin v1.0.0-mb
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
  const currentReleaseVersion = process.argv[2]; // e.g., "1.0.0-mb"
  const description = process.argv[3]; // e.g., "Bump version to 1.0.0-mb"
  if (!currentReleaseVersion || !description) {
    console.error(
      "❌ Usage: node createTags.ts <current-release-version> <high level description of the changes>"
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
      // 1️⃣ Checkout master and pull latest changes
      runCommand(`git checkout master`, servicePath);
      runCommand(`git pull origin master`, servicePath);

      // 2️⃣ Create tag for the current release branch
      runCommand(
        `git tag v${currentReleaseVersion} -a -m "${description}"`,
        servicePath
      );

      // 3️⃣ Push the tag to the remote repository
      // runCommand(`git push origin v${currentReleaseVersion}`, servicePath);

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
