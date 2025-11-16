import os
import subprocess
import sys
import urllib.request

# -----------------------------
# Helper Functions
# -----------------------------
def is_tool_installed(command):
    try:
        subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        return True
    except subprocess.CalledProcessError:
        return False
    except FileNotFoundError:
        return False

def download_file(url, filename):
    print(f"Downloading {filename} ...")
    urllib.request.urlretrieve(url, filename)
    print(f"Downloaded {filename}.")

def run_installer(filename, silent_args="/quiet /norestart"):
    print(f"Running installer {filename} ...")
    subprocess.run(f"{filename} {silent_args}", shell=True)
    print(f"Finished installer {filename}.")

def install_npm_packages(packages):
    for pkg in packages:
        print(f"Installing npm package: {pkg}")
        subprocess.run(f"npm install {pkg}", shell=True)

# -----------------------------
# URLs for installers (Windows)
# -----------------------------
NODE_URL = "https://nodejs.org/dist/v20.9.1/node-v20.9.1-x64.msi"  # change to latest LTS if needed
MONGO_URL = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-6.0.9-signed.msi"

npm_packages = [
    "express",
    "mongoose",
    "dotenv",
    "bcryptjs",
    "jsonwebtoken",
    "cors",
    "nodemailer",
    "pm2"
]

# -----------------------------
# Main Script
# -----------------------------
def main():
    # 1️⃣ Install Node.js
    if not is_tool_installed("node -v"):
        node_installer = os.path.join(os.getcwd(), "node_installer.msi")
        download_file(NODE_URL, node_installer)
        run_installer(node_installer)
    else:
        print("✅ Node.js is already installed.")

    # 2️⃣ Install npm (comes with Node.js)
    if not is_tool_installed("npm -v"):
        print("❌ npm not found. Make sure Node.js installation succeeded.")
    else:
        print("✅ npm is installed.")

    # 3️⃣ Install MongoDB
    if not is_tool_installed("mongod --version"):
        mongo_installer = os.path.join(os.getcwd(), "mongodb_installer.msi")
        download_file(MONGO_URL, mongo_installer)
        run_installer(mongo_installer)
    else:
        print("✅ MongoDB is already installed.")

    # 4️⃣ Initialize npm project if package.json missing
    if not os.path.exists("package.json"):
        print("Initializing npm project...")
        subprocess.run("npm init -y", shell=True)

    # 5️⃣ Install backend npm packages
    if is_tool_installed("npm -v"):
        install_npm_packages(npm_packages)
    else:
        print("⚠️ npm not found. Cannot install packages.")

    print("\n✅ Environment setup complete! Please check installations and restart terminal if needed.")

if __name__ == "__main__":
    main()
