// !! IMPORTANT !!
// NOTE: THIS SCRIPT IS FOR CREATING A NEW DEVELOPMENT BRANCH AND VERSION FOR MULTIPLE MICROSERVICES FROM A RELEASE BRANCH

// Usage: node createNewDevelopentBranch.ts <currentReleaseBranch> <developmentBranch> <brand/s["mi", "ck", "gw"]>
// Example: node createNewDevelopmentBranch.ts 1.0.0 1.0.0 mi ck gw
// Note: I made the current release branch and development branch dynamic to support a flexible approach,
// since the current release version might differ from the development release version.
// e.g., release/v1.0.0 (current release branch) vs. release/v1.0.0-1-mi (development branch)

// This script will create new development branch from current release branch for all microservices.
// It creates a new development branch from current release branch for each microservice.
// The script is useful when you need to create new development branch to current release branch for multiple microservices.
// It helps to avoid conflicts and ensures that the development branch is up-to-date with the latest changes in current release branch.
// The script uses the new development branch name for each microservice.
// The script runs the following Git commands for each microservice:
// 1. git checkout release/v<currentReleaseBranch>
// 2. git pull origin release/v<currentReleaseBranch>
// 3. git checkout -b release/v<developmentBranch>-<brand>
// 4. npm version <developmentBranch>-<brand> --no-git-tag-version
// 5. git commit -m "chore: FAL-755 Bump version to <developmentBranch>-<brand>"

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

  // List of files to update in each microservice
  const filesToUpdate = [
    "task-definition-dev.json",
    "task-definition-sit.json",
    "task-definition-uat.json",
    "task-definition-stg.json",
    "task-definition-prd.json",
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
  const currentReleaseBranch = process.argv[2]; // e.g., "1.0.0"
  const developmentBranch = process.argv[3]; // e.g., "1.0.0"
  const brands = process.argv.slice(4); // e.g., ["mi", "ck", "gw"]

  if (!currentReleaseBranch || !developmentBranch || !brands.length) {
    console.error(
      "❌ Usage: node createNewDevelopentBranch.ts <currentReleaseBranch> <developmentBranch> <brand/s['mi', ck', 'gw']>"
    );
    process.exit(1);
  }

  // Function to update the image in JSON files
  function updateVersion(filePath, developmentBranch, brand) {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File not found: ${filePath}`);
      return;
    }

    try {
      let content = fs.readFileSync(filePath, "utf8");

      if (filePath.includes("task-definition")) {
        // Match and replace any version tag after the service name
        const imageRegex = new RegExp(
          `("image":\\s*"\\d+\\.dkr\\.ecr\\.ap-southeast-1\\.amazonaws\\.com\\/(?:${microservices.join(
            "|"
          )}):)[^"]+(")`,
          "g"
        );

        content = content.replace(
          imageRegex,
          `$1${developmentBranch}-${brand}$2`
        );
      }

      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Updated ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to update ${filePath}:`, error);
    }
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

      console.log(`🔹 DEVELOPMENT BRANCH MANAGEMENT 🔹`);
      console.log(`🔹 Processing microservice: ${service}`);

      // ========================= Commands ========================= //
      for (const brand of brands) {
        // 1️⃣ Checkout master and pull latest changes
        runCommand(
          `git checkout release/v${currentReleaseBranch}`,
          servicePath
        );
        runCommand(
          `git pull origin release/v${currentReleaseBranch}`,
          servicePath
        );

        // 2️⃣ Create a new development branch
        runCommand(
          `git checkout -b release/v${developmentBranch}-${brand}`,
          servicePath
        );

        // 3️⃣ Update the version inside necessary files **before** running npm version
        for (const file of filesToUpdate) {
          const filePath = path.join(
            __dirname,
            "..",
            service,
            `/task-definition/${brand}`,
            file
          );
          updateVersion(filePath, developmentBranch, brand);
        }

        // 4️⃣ Run npm version **after** updating the version inside files
        runCommand(
          `npm version ${developmentBranch}-${brand} --no-git-tag-version`,
          servicePath
        );

        // 5️⃣ Git add and commit
        runCommand(`git add .`, servicePath);
        runCommand(
          `git commit -m "chore: FAL-3253 Bump version to ${developmentBranch}-${brand}"`,
          servicePath
        );
        // runCommand(`git push origin release/v${developmentBranch}-${brand}`, servicePath);
      }
      // ========================= Commands ========================= //

      console.log(`✅ Created New Development Branch completed for ${service}`);

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
    console.log(
      "🎉 You may now push all microservices on the REMOTE BRANCH! 🎉"
    );
  })();
})();
