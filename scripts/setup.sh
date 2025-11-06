#!/bin/bash

# LevelUp Setup Script

echo "🎮 LevelUp Setup Script"
echo "======================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please fill in your environment variables."
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database and API credentials"
echo "2. Run 'npm run db:push' to set up your database"
echo "3. Run 'npm run dev' to start the development server"
echo ""
echo "Happy coding! 🚀"
