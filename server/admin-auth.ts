import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Secure admin credentials - completely separate from user system
const ADMIN_CREDENTIALS = {
  username: "adminangad",
  // Password: "angadadmin" - will be hashed on first use
  passwordHash: "", // Will be generated automatically
};

export async function hashAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function verifyAdminPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(password, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    return false;
  }
}

export async function authenticateAdmin(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_CREDENTIALS.username) {
    return false;
  }
  
  // For initial setup, if no hash exists, create one
  if (!ADMIN_CREDENTIALS.passwordHash) {
    ADMIN_CREDENTIALS.passwordHash = await hashAdminPassword("angadadmin");
  }
  
  return await verifyAdminPassword(password, ADMIN_CREDENTIALS.passwordHash);
}

export function isAdminAuthenticated(req: any): boolean {
  return req.session && req.session.isAdmin === true;
}

export function setAdminSession(req: any): void {
  req.session.isAdmin = true;
  req.session.adminUsername = ADMIN_CREDENTIALS.username;
  req.session.adminLoginTime = Date.now();
}

export function clearAdminSession(req: any): void {
  req.session.isAdmin = false;
  delete req.session.adminUsername;
  delete req.session.adminLoginTime;
}