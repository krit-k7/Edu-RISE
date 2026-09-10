#!/bin/bash

# Add the local user's bin directory to the PATH.
export PATH="/root/.local/bin:$PATH"

# Set the NVM installation directory.
export NVM_DIR="/root/.nvm"

# Load NVM if the nvm.sh file exists.
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Navigate to the Midnight project directory.
cd "/mnt/d/risein/MOON/New folder"

# Install vite-node as a development dependency.
yarn add -D vite-node

# Select the Midnight Preview network.
export MIDNIGHT_NETWORK=preview

# Load environment variables from the preview environment file.
export $(cat .env.preview | xargs)

# Deploy the scholarship contract to the Preview network.
yarn deploy:preview
