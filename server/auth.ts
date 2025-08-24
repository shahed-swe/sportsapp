import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { clearAdminSession } from "./admin-auth";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Generate secure remember token
function generateRememberToken(): string {
  return randomBytes(32).toString('hex');
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days - only expires on manual logout
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      httpOnly: true, // Prevent XSS attacks
      sameSite: 'lax' // CSRF protection
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false); // User no longer exists, invalidate session
      }
      done(null, user);
    } catch (error) {
      console.error('Failed to deserialize user:', error);
      done(null, false); // Invalidate session on error
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Check for existing username
      const existingUsername = await storage.getUserByUsername(req.body.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check for existing email
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Check for existing phone
      const existingPhone = await storage.getUserByPhone(req.body.phone);
      if (existingPhone) {
        return res.status(400).json({ message: "Phone number already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, async (err) => {
        if (err) return next(err);
        
        // Generate remember token if requested
        let userWithToken = { ...user } as any;
        if (req.body.rememberMe) {
          const token = generateRememberToken();
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
          
          // Create remember token
          await storage.createRememberToken(user.id, token, expiresAt);
          userWithToken.rememberToken = token;
        }
        
        res.status(201).json(userWithToken);
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), async (req, res) => {
    try {
      const { rememberMe } = req.body;
      let rememberToken = null;

      // Generate remember token if requested
      if (rememberMe && req.user) {
        const token = generateRememberToken();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        
        // Clean up old tokens for this user
        await storage.deleteUserRememberTokens(req.user.id);
        
        // Create new remember token
        await storage.createRememberToken(req.user.id, token, expiresAt);
        rememberToken = token;
      }

      res.status(200).json({ 
        ...req.user, 
        rememberToken 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(200).json(req.user);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    // Clear admin session when user logs out
    clearAdminSession(req);
    req.logout((err) => {
      if (err) return next(err);
      // Destroy session completely
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid'); // Clear session cookie
        res.status(200).json({ message: 'Logged out successfully', redirect: '/login' });
      });
    });
  });

  // Quick login with remember token
  app.post("/api/quick-login", async (req, res, next) => {
    try {
      const { rememberToken } = req.body;
      
      if (!rememberToken) {
        return res.status(400).json({ message: "Remember token required" });
      }

      // Get token from database
      const tokenData = await storage.getRememberToken(rememberToken);
      
      if (!tokenData) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Check if token is expired
      if (new Date() > tokenData.expiresAt) {
        // Clean up expired token
        await storage.deleteRememberToken(rememberToken);
        return res.status(401).json({ message: "Token expired" });
      }

      // Get user
      const user = await storage.getUser(tokenData.userId);
      if (!user) {
        await storage.deleteRememberToken(rememberToken);
        return res.status(401).json({ message: "User not found" });
      }

      // Log user in
      req.login(user, (err) => {
        if (err) {
          console.error('Quick login error:', err);
          return res.status(500).json({ message: "Login failed" });
        }
        res.status(200).json(user);
      });
    } catch (error) {
      console.error('Quick login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
