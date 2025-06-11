// Usage: node createNewReleaseBranch.ts <new-release-branch (next sprint)> <new version> ["mi", "ck", "gw"]
// Example: node createNewReleaseBranch.ts release/v1.0.0-rc1 1.0.0-rc1 mi ck gw
//
// This script will create new release branch and new version for all microservices.
// It creates a new branch and new version for each microservice.
// The script is useful when you need to create new release branch to master for multiple microservices.
// It helps to avoid conflicts and ensures that the release branch is up-to-date with the latest changes in master.
// The script uses the new release branch name and new version for each microservice.
// The script runs the following Git commands for each microservice:
// 1. git checkout master
// 2. git pull origin master
// 3. git checkout -b <new-release-branch>
// 4. npm version 1.0.0-rc1 --no-git-tag-version
// 5. git commit -m "chore: FAL-755 Bump version to 1.0.0-rc1

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
const newReleaseBranch = process.argv[2]; // e.g., "release/v1.0.0-rc1"
const version = process.argv[3]; // e.g., "1.0.0-rc1"
const brands = process.argv.slice(4); // e.g., ["mi", "ck", "gw"]

if (!newReleaseBranch || !version || !brands.length) {
  console.error(
    "❌ Usage: node releasebranch.ts <new-release-branch> <version> <brands...>"
  );
  process.exit(1);
}

// Function to update the image in JSON files
function updateVersion(filePath, newVersion) {
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

      content = content.replace(imageRegex, `$1${newVersion}$2`);
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

    console.log(`🔹 RELEASE BRANCH MANAGEMENT 🔹`);
    console.log(`🔹 Processing microservice: ${service}`);

    // ========================= Commands ========================= //
    // 1️⃣ Checkout master and pull latest changes
    runCommand("git checkout master", servicePath);
    runCommand("git pull origin master", servicePath);

    // 2️⃣ Create a new release branch
    runCommand(`git checkout -b ${newReleaseBranch}`, servicePath);

    for (const brand of brands) {
      // 3️⃣ Update the version inside necessary files **before** running npm version
      for (const file of filesToUpdate) {
        const filePath = path.join(
          __dirname,
          "..",
          service,
          `/task-definition/${brand}`,
          file
        );
        console.log({ filePath });
        updateVersion(filePath, version);
      }
    }

    // 4️⃣ Run npm version **after** updating the version inside files
    runCommand(`npm version ${version} --no-git-tag-version`, servicePath);

    // 5️⃣ Git add and commit
    runCommand(`git add .`, servicePath);
    runCommand(
      `git commit -m "chore: FAL-3253 Bump version to ${version}"`,
      servicePath
    );
    // runCommand(`git push origin release/v${version}`, servicePath);
    // ========================= Commands ========================= //

    console.log(`✅ Created New Release Branch completed for ${service}`);

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
  console.log("🎉 You may now push all microservices on the REMOTE BRANCH! 🎉");
})();
