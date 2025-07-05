# NGBilling Backend API

Express.js backend API for the NGBilling application with TypeScript, MySQL, and JWT authentication.

## Features

- 🔐 JWT Authentication
- 👥 User Management
- 👥 Customer Management (CRUD)
- 📦 Product Management (CRUD)
- 📄 Invoice Management (CRUD)
- 📋 Quote Management (CRUD)
- 📦 Delivery Notes (CRUD)
- 💰 Payment Tracking
- 📊 Reports Generation
- 🛡️ Security with Helmet
- ✅ Input Validation
- 🚨 Error Handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: TypeORM
- **Authentication**: JWT
- **Validation**: express-validator
- **Security**: Helmet, CORS

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit the .env file with your database credentials
   nano .env
   ```

4. **Database Setup**
   ```sql
   -- Create the database
   CREATE DATABASE ngbilling;
   
   -- Create a user (optional)
   CREATE USER 'ngbilling_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON ngbilling.* TO 'ngbilling_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. **Environment Variables**
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=your_password
   DB_DATABASE=ngbilling
   DB_SYNCHRONIZE=true
   DB_LOGGING=true
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=24h
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173
   
   # API Configuration
   API_PREFIX=/api/v1
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile

### Clients
- `GET /api/v1/clients` - Get all clients
- `GET /api/v1/clients/:id` - Get client by ID
- `POST /api/v1/clients` - Create new client
- `PUT /api/v1/clients/:id` - Update client
- `DELETE /api/v1/clients/:id` - Delete client

### Products
- `GET /api/v1/produits` - Get all products
- `GET /api/v1/produits/low-stock` - Get products with low stock
- `GET /api/v1/produits/:id` - Get product by ID
- `POST /api/v1/produits` - Create new product
- `PUT /api/v1/produits/:id` - Update product
- `DELETE /api/v1/produits/:id` - Delete product

## Database Schema

The application uses TypeORM entities that automatically create the following tables:

- `users` - User accounts and authentication
- `clients` - Customer information
- `produits` - Product catalog
- `factures` - Invoices
- `devis` - Quotes
- `bons_livraison` - Delivery notes
- `paiements` - Payment records
- `lignes_document` - Document line items

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Development

### Project Structure
```
src/
├── config/
│   └── database.ts
├── controllers/
│   ├── authController.ts
│   ├── clientController.ts
│   └── produitController.ts
├── middlewares/
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validation.ts
├── models/
│   ├── User.ts
│   ├── Client.ts
│   ├── Produit.ts
│   ├── Facture.ts
│   ├── Devis.ts
│   ├── BonLivraison.ts
│   ├── Paiement.ts
│   └── LigneDocument.ts
├── routes/
│   ├── auth.ts
│   ├── clients.ts
│   └── produits.ts
├── app.ts
└── server.ts
```

### Adding New Features

1. **Create Model**: Add new TypeORM entity in `src/models/`
2. **Create Controller**: Add business logic in `src/controllers/`
3. **Create Routes**: Add API endpoints in `src/routes/`
4. **Update App**: Register new routes in `src/app.ts`

## Security

- JWT token authentication
- Password hashing with bcrypt
- Input validation with express-validator
- CORS protection
- Helmet security headers
- SQL injection protection via TypeORM

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 