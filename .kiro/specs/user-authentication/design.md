# User Authentication System Design

## Architecture Overview

The authentication system will be built as a secure, scalable solution that integrates seamlessly with the existing VerifyCert infrastructure. It follows a traditional JWT-based authentication pattern with OTP verification for enhanced security.

## System Components

### 1. Database Layer

#### User Table Schema
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  region VARCHAR(10) DEFAULT 'US',
  role ENUM('user', 'issuer', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT check_email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
```

#### OTP Table Schema
```sql
CREATE TABLE otps (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  type ENUM('email', 'sms', 'password_reset') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Backend API Layer

#### Authentication Flow Architecture
```
Client Request → Rate Limiter → Input Validation → Business Logic → Database → Response
```

#### Key Services

**AuthService**
- User registration and login
- Password hashing and verification
- JWT token generation and validation
- Session management

**OTPService**
- OTP generation (6-digit random codes)
- Email/SMS delivery
- OTP validation and expiration handling
- Resend functionality with rate limiting

**NotificationService**
- Email delivery via SMTP (Nodemailer/SendGrid)
- SMS delivery via Twilio/Africa's Talking
- Template management for different message types
- Delivery status tracking

### 3. Frontend Architecture

#### Component Hierarchy
```
App
├── AuthProvider (Context)
├── Router
│   ├── PublicRoutes
│   │   ├── LoginPage
│   │   ├── SignupPage
│   │   ├── ForgotPasswordPage
│   │   └── VerifyOTPPage
│   └── ProtectedRoutes
│       ├── Dashboard
│       ├── Profile
│       └── IssuerFeatures
```

#### State Management
- **AuthContext**: Global authentication state
- **useAuth Hook**: Authentication operations and state access
- **Local Storage**: JWT token persistence
- **Session Management**: Automatic token refresh and logout

## Security Considerations

### Password Security
- Bcrypt hashing with salt rounds (minimum 12)
- Password policy enforcement (8+ chars, mixed case, numbers, symbols)
- Secure password reset flow with time-limited OTPs

### Token Security
- JWT tokens with short expiration (24 hours)
- Secure token storage (httpOnly cookies in production)
- Token blacklisting for logout
- Automatic token refresh mechanism

### Rate Limiting
- Login attempts: 5 per minute per IP
- OTP requests: 3 per 5 minutes per user
- Registration: 10 per hour per IP
- Password reset: 3 per hour per user

### Data Protection
- HTTPS enforcement for all auth endpoints
- Input sanitization and validation
- SQL injection prevention with parameterized queries
- XSS protection with proper output encoding#
# API Endpoints Design

### Authentication Endpoints

#### POST /api/auth/register
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com", // OR phone
  "phone": "+1234567890",      // OR email
  "password": "SecurePass123!",
  "region": "US"
}

Response:
{
  "success": true,
  "message": "Registration successful. Please verify your account.",
  "userId": 123
}
```

#### POST /api/auth/verify-otp
```json
Request:
{
  "userId": 123,
  "code": "123456",
  "type": "email" // or "sms"
}

Response:
{
  "success": true,
  "message": "Account verified successfully",
  "token": "jwt-token-here"
}
```

#### POST /api/auth/login
```json
Request:
{
  "identifier": "john@example.com", // email or phone
  "password": "SecurePass123!"
}

Response:
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": true
  }
}
```

## Regional Configuration

### Supported Regions
- **US/CA**: Email-first approach, Twilio SMS
- **EU**: Email-first approach, local SMS providers
- **Africa**: Phone-first approach, Africa's Talking SMS
- **Asia**: Mixed approach based on country

### Phone Number Validation
```javascript
const phoneValidation = {
  'US': /^\+1[2-9]\d{2}[2-9]\d{2}\d{4}$/,
  'UK': /^\+44[1-9]\d{8,9}$/,
  'KE': /^\+254[17]\d{8}$/,
  'NG': /^\+234[789]\d{9}$/
};
```

## Integration Points

### Existing VerifyCert Features
1. **Certificate Minting**: Add user authentication requirement
2. **Issuer Dashboard**: Protect with authentication middleware
3. **Public Verification**: Maintain open access
4. **User Certificates**: Associate certificates with authenticated users

### Database Integration
- Add `user_id` foreign key to existing certificate tables
- Maintain backward compatibility with existing certificates
- Create migration scripts for schema updates

## Error Handling Strategy

### Backend Error Responses
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email"
  }
}
```

### Frontend Error Handling
- Form-level validation with real-time feedback
- Global error boundary for unexpected errors
- Toast notifications for user feedback
- Graceful degradation for network issues

## Performance Considerations

### Database Optimization
- Indexes on email, phone, and user_id columns
- Connection pooling for database connections
- Query optimization for auth operations
- Caching for frequently accessed user data

### Frontend Optimization
- Lazy loading of authentication components
- Code splitting for auth-related routes
- Optimistic UI updates for better UX
- Debounced validation for form inputs

## Monitoring & Analytics

### Key Metrics
- User registration rate
- Login success/failure rates
- OTP delivery success rates
- Password reset completion rates
- Regional usage patterns

### Logging Strategy
- Authentication events (login, logout, registration)
- Failed authentication attempts
- OTP generation and validation
- Security-related events (rate limiting, suspicious activity)

## Deployment Considerations

### Environment Setup
- Separate configurations for development, staging, production
- Secure credential management (environment variables)
- SSL certificate configuration
- Database migration scripts

### Scalability Planning
- Horizontal scaling for API servers
- Database read replicas for auth queries
- CDN for static auth assets
- Load balancing for high availability