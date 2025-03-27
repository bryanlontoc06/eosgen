// Usage: node mergetomasterbranch.ts <release-branch(current)> <ticket-id(current sprint chore ticket ID)>
// Example: node mergetomasterbranch.ts release/v0.0.0 FAL-2014
//
// This script rebases the release branch to master for all microservices.
// It creates a new branch for each microservice with the rebase changes.
// The script is useful when you need to merge a release branch to master for multiple microservices.
// It helps to avoid conflicts and ensures that the release branch is up-to-date with the latest changes in master.
// The script uses the release branch name and ticket ID to create a new branch for each microservice.
// The new branch name format is "chore/<ticket-id>-merge-to-master".
// The script runs the following Git commands for each microservice:
// 1. git checkout master
// 2. git pull origin master
// 3. git checkout <release-branch>
// 4. git pull origin <release-branch>
// 5. git checkout -b <chore-branch>
// 6. git rebase master
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
    // "falcon-cart-svc",
    "falcon-console-bff",
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
  function getUserConfirmation(question) {
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(`${question} (y/n): `, (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "y");
      });
    });
  }

  // Get dynamic values from command-line arguments
  const releaseBranch = process.argv[2]; // e.g., "release/v0.22.0 (current Branch)"
  const ticketId = process.argv[3]; // e.g., "FAL-2014 (current sprint chore ticket ID)"

  if (!releaseBranch || !ticketId) {
    console.error(
      "❌ Usage: node mergetomasterbranch.ts <release-branch> <ticket-id>"
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

      const choreBranch = `chore/${ticketId}-merge-to-master`;

      console.log(`🔹 Processing microservice: ${service}`);

      // ========================= Commands ========================= //
      runCommand("git checkout master", servicePath);
      runCommand("git pull origin master", servicePath);

      runCommand(`git checkout ${releaseBranch}`, servicePath);
      runCommand(`git pull origin ${releaseBranch}`, servicePath);

      runCommand(`git checkout -b ${choreBranch}`, servicePath);
      runCommand(`git rebase ${releaseBranch}`, servicePath);
      runCommand(`git rebase master`, servicePath);
      // ========================= Commands ========================= //

      console.log(`✅ Rebase completed for ${service}`);

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

    console.log("🎉 Git rebase process completed for all microservices!");
    console.log("🎉 You may now create a Tag for each microservices! 🎉");
  })();
})();
