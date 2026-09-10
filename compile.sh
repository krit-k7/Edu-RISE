#!/bin/bash

# Add the local user binaries directory to PATH
export PATH="/root/.local/bin:$PATH"

# Set the NVM (Node Version Manager) directory
export NVM_DIR="/root/.nvm"

# Load NVM if the nvm.sh script exists
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Navigate to the project directory
cd "/mnt/d/risein/MOON/New folder"

# Compile the project using Yarn
yarn compile
