# Stacks Next.js Template

A production-ready Next.js template for building Stacks blockchain applications with wallet authentication, smart contract integration, and modern UI components.

## 🚀 Features

- **🔗 Wallet Integration**: Seamless Stacks wallet connection using `@stacks/connect`
- **🔐 JWT Authentication**: Secure authentication with wallet signatures
- **📱 Modern UI**: Beautiful, responsive interface with Tailwind CSS and Radix UI
- **🗄️ Database Ready**: MongoDB integration with Prisma ORM
- **📝 Type Safety**: Full TypeScript support with proper type definitions
- **🎨 Component Library**: Pre-built UI components following design system patterns
- **📊 API Routes**: RESTful API endpoints for authentication and user management
- **🔧 Developer Experience**: Biome for linting/formatting, hot reload, and more

## 🏗️ Project Structure

```
├── app/                    # Next.js 13+ app router
│   ├── api/auth/          # Authentication API endpoints
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main wallet connection page
├── components/            # React components
│   ├── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
│   ├── wallet.ts         # Wallet connection and auth
│   └── api-client.ts     # API client with auth
├── lib/                  # Utility libraries
│   ├── auth/            # JWT and authentication utilities
│   ├── db/              # Database operations
│   ├── config/          # Configuration files
│   └── types/           # TypeScript type definitions
├── providers/           # React context providers
├── contracts/           # Stacks smart contracts
├── prisma/             # Database schema and migrations
└── _docs/              # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MongoDB database
- Stacks wallet (Hiro Wallet, Xverse, etc.)

### Installation

1. **Clone the template**
   ```bash
   git clone <your-repo-url>
   cd stacks-next-template
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="mongodb://localhost:27017/stacks-next-template"
   
   # JWT Secret (change this in production)
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   
   # API Configuration
   NEXT_PUBLIC_API_URL="http://localhost:3000/api"
   ```

4. **Set up the database**
   ```bash
   pnpm db:push
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run Biome linter
pnpm format           # Format code with Biome

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes to database
pnpm db:reset         # Reset database (development only)
pnpm db:studio        # Open Prisma Studio
```

## 🔐 Authentication Flow

The template implements a complete wallet-based authentication system:

1. **Wallet Connection**: Users connect their Stacks wallet
2. **Nonce Generation**: Server generates a unique nonce for signing
3. **Message Signing**: User signs an authentication message
4. **JWT Token**: Server verifies signature and issues JWT token
5. **Session Management**: Client stores session and includes token in API requests

### API Endpoints

- `POST /api/auth/nonce` - Generate authentication nonce
- `POST /api/auth/login` - Authenticate with wallet signature  
- `GET /api/auth/me` - Get current user profile

See [`_docs/API_ENDPOINTS.md`](_docs/API_ENDPOINTS.md) for detailed API documentation.

## 🎨 UI Components

The template includes a comprehensive set of UI components:

- **Button**: Multiple variants and sizes
- **Card**: Content containers with header, body, and footer
- **Input**: Form input components
- **Wallet Connection**: Complete wallet connection interface

All components follow design system patterns and support dark mode.

## 🗄️ Database Schema

The template uses MongoDB with Prisma ORM. The main user model includes:

```prisma
model User {
  id                 String   @id @default(auto()) @map("_id") @db.ObjectId
  walletAddress      String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  lastLoginAt        DateTime?
  loginCount         Int      @default(0)
  connectionHistory  Json
  @@map("users")
}
```


## 🛠️ Development Guidelines

### Code Quality
- Use Biome for linting and formatting
- Follow TypeScript best practices
- Implement proper error handling
- Use semantic commit messages

### Component Development
- Use existing UI components from `components/ui/`
- Implement proper loading and error states
- Use TypeScript for all props and state

### API Development
- Follow RESTful patterns
- Use Zod for request validation
- Implement proper error responses
- Use the authentication middleware for protected routes

## 📚 Documentation

- [`_docs/API_ENDPOINTS.md`](_docs/API_ENDPOINTS.md) - Complete API documentation
- [Cursor Rules](.cursor/rules/) - Development guidelines and patterns

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The template works with any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Useful Links

- [Stacks Documentation](https://docs.stacks.co/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](_docs/)
2. Search existing [GitHub Issues](https://github.com/Mcsavvy/stacks-next-template/issues)
3. Create a new issue with detailed information

---

**Happy building! 🚀**
