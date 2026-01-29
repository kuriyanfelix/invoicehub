#!/bin/bash

# This script generates all remaining application files

cd /home/claude/invoice-extraction-mvp

# Create necessary directories
mkdir -p app/api/auth/\[...nextauth\]
mkdir -p app/api/files/\[key\]
mkdir -p app/\(auth\)/login
mkdir -p app/\(dashboard\)
mkdir -p app/\(dashboard\)/dashboard
mkdir -p app/\(dashboard\)/upload
mkdir -p app/\(dashboard\)/history  
mkdir -p app/\(dashboard\)/invoices/\[id\]
mkdir -p components/dashboard
mkdir -p actions

echo "Directories created successfully"
