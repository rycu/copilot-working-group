#!/bin/bash
# GitHub Copilot Agent Setup Script
# This script prepares the development environment for the Copilot agent

set -e

echo "Setting up GitHub Copilot agent environment..."

# Install dependencies
echo "Installing npm dependencies..."
npm ci

echo "Setup complete!"
