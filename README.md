# EOSGen App

This repository contains scripts to automate the end-of-sprint process, including merging the sprint branch into the master branch and creating a new release branch for multiple microservices.

## 🚀 Features
- 🔄 Automates merging the sprint branch into the master branch.
- 🌱 Creates a new release branch with a specified version.
- 🏷 Ensures proper branch naming conventions.
- 📌 Updates necessary version files before committing.
- ⚡ Streamlines Git operations for multiple microservices.

## 🛠 Prerequisites
- **📌 Node.js** installed on your system.
- **📌 Git** installed and configured.
- Ensure each microservice exists within the project directory.

## 📥 Installation
```sh
# Clone this repository
git clone <repo-url>
cd <repo-name>

# Install dependencies
npm install @types/node --save-dev
```

---

## 📌 Scripts

### 🔄 Merge Release Branch to Master
This script merges the current release branch into the master branch for all microservices.

#### 📝 Usage
```sh
node mergetomasterbranch.ts <release-branch> <ticket-id>
```
**Example:**
```sh
node mergetomasterbranch.ts release/v0.0.0 FAL-2014
```

#### ⚡ Git Operations:
1. ✅ Checkout `master` branch and pull latest changes.
2. ✅ Checkout the given release branch and pull the latest changes.
3. ✅ Create a new branch following the format `chore/<ticket-id>-merge-to-master`.
4. ✅ Rebase the release branch to `master`.
5. 🔀 Optionally, push the new branch to the remote repository.

---

### 🌱 Create New Release Branch
This script creates a new release branch and bumps the version for all microservices.

#### 📝 Usage
```sh
node createNewReleaseBranch.ts <new-release-branch> <version>
```
**Example:**
```sh
node createNewReleaseBranch.ts release/v1.0.0-rc1 1.0.0-rc1
```

#### ⚡ Git Operations:
1. ✅ Checkout `master` and pull the latest changes.
2. ✅ Create a new release branch.
3. ✅ Update necessary version files.
4. ✅ Update package version without creating a Git tag.
5. ✅ Commit changes with the message: `chore: Bump version to <version>`.
6. 🔀 Optionally, push the new release branch to the remote repository.

---

## 📂 File Structure
```text
/
├── *******-web-bff/  # 🛠 Microservice directory
├── *******--connect-svc/  # 🛠 Microservice directory
├── *******--product-svc/  # 🛠 Microservice directory
│   ...
├── eosgen/  # 📁 EOSGen scripts and configurations
│   ├── mergetomasterbranch.ts  # 🔄 Script to merge the release branch to master
│   ├── createNewReleaseBranch.ts  # 🌱 Script to create a new release branch
│   ├── package.json  # 📜 Node.js project configuration
│   ├── package-lock.json  # 📜 Dependency lock file
│   ├── .gitignore  # 🚫 Ignores node_modules and other unnecessary files
```

## 🚫 .gitignore
```text
node_modules/
```

## 📜 License
MIT License

