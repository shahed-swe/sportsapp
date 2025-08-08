import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { signupSchema, loginSchema, type InsertUser, type LoginData } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, Trophy, Target, Zap, Upload, Users, PlayCircle, Newspaper, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(false);
  const isMobile = useIsMobile();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState<{ available: boolean; suggestions?: string[] } | null>(null);
  const [emailCheck, setEmailCheck] = useState<{ available: boolean } | null>(null);
  const [phoneCheck, setPhoneCheck] = useState<{ available: boolean } | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  const signupForm = useForm<InsertUser & { confirmPassword: string }>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      username: "",
      userType: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Real-time username validation
  const checkUsername = async (username: string) => {
    if (username.length < 3) return;
    
    setIsCheckingUsername(true);
    try {
      const response = await fetch(`/api/check-username/${encodeURIComponent(username)}`);
      const result = await response.json();
      setUsernameCheck(result);
    } catch (error) {
      console.error("Failed to check username:", error);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Real-time email validation
  const checkEmail = async (email: string) => {
    if (!email.includes("@")) return;
    
    setIsCheckingEmail(true);
    try {
      const response = await fetch(`/api/check-email/${encodeURIComponent(email)}`);
      const result = await response.json();
      setEmailCheck(result);
    } catch (error) {
      console.error("Failed to check email:", error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Real-time phone validation
  const checkPhone = async (phone: string) => {
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) return;
    
    setIsCheckingPhone(true);
    try {
      const response = await fetch(`/api/check-phone/${encodeURIComponent(phone)}`);
      const result = await response.json();
      setPhoneCheck(result);
    } catch (error) {
      console.error("Failed to check phone:", error);
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handleSignup = async (data: InsertUser & { confirmPassword: string }) => {
    if (!acceptTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the Terms and Conditions to continue.",
        variant: "destructive",
      });
      return;
    }
    
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData, {
      onSuccess: () => {
        toast({
          title: "Account created successfully!",
          description: "Please sign in with your new credentials.",
        });
        // Redirect to login form
        setIsLogin(true);
        // Reset accept terms for the login form
        setAcceptTerms(false);
        // Reset signup form
        signupForm.reset();
      },
    });
  };

  const handleLogin = async (data: LoginData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to SportsApp",
        });
        setLocation("/");
      },
    });
  };

  const applySuggestion = (suggestion: string) => {
    signupForm.setValue("username", suggestion);
    setUsernameCheck(null);
  };

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="auth-page min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-red-500 relative overflow-hidden">
      {/* Animated Sports Background Elements */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      {/* Floating Sports Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 animate-bounce">
          <Trophy className="h-8 w-8 text-yellow-300 opacity-30" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-pulse">
          <Target className="h-6 w-6 text-white opacity-40" />
        </div>
        <div className="absolute bottom-1/4 left-1/3 animate-bounce delay-300">
          <Zap className="h-7 w-7 text-orange-300 opacity-30" />
        </div>
      </div>

      {isMobile ? (
        /* Mobile Layout */
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Mobile Header with Welcome Text */}
          <div className="pt-8 pb-6 px-6 text-center">
            <h1 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              <span className="text-white">SPORTS</span>
              <span className="text-yellow-300">APP</span>
            </h1>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isLogin ? "Welcome Back!" : "Welcome to SportsApp"}
            </h2>
            <p className="text-blue-100">
              {isLogin ? "Ready to dive back into sports?" : "Connect with athletes and fans worldwide"}
            </p>
          </div>

          {/* Mobile Form */}
          <div className="flex-1 px-6">
            <Card className="shadow-2xl bg-white/95 backdrop-blur-sm border-0">
              <CardContent className="p-6">
                {isLogin ? (
                  /* Login Form */
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <Label htmlFor="loginUsername">Username</Label>
                  <Input
                    id="loginUsername"
                    type="text"
                    placeholder="Enter your username"
                    {...loginForm.register("username")}
                    className="mt-2"
                  />
                  {loginForm.formState.errors.username && (
                    <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="loginPassword">Password</Label>
                  <Input
                    id="loginPassword"
                    type="password"
                    placeholder="Enter your password"
                    {...loginForm.register("password")}
                    className="mt-2"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex justify-end mt-2">
                  <Button variant="ghost" type="button" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot Password?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 mt-4"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                    >
                      Create one here
                    </Button>
                  </p>
                </div>
                  </form>
                ) : (
                  /* Signup Form */
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-6">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    {...signupForm.register("fullName")}
                    className="mt-2"
                  />
                  {signupForm.formState.errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a unique username"
                    {...signupForm.register("username", {
                      onChange: (e) => {
                        const value = e.target.value;
                        if (value.length >= 3) {
                          checkUsername(value);
                        } else {
                          setUsernameCheck(null);
                        }
                      },
                    })}
                    className="mt-2"
                  />
                  {signupForm.formState.errors.username && (
                    <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.username.message}</p>
                  )}
                  
                  {isCheckingUsername && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Checking availability...
                    </div>
                  )}
                  
                  {usernameCheck && !usernameCheck.available && (
                    <div className="mt-2">
                      <div className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="mr-1 h-4 w-4" />
                        Username already taken
                      </div>
                      {usernameCheck.suggestions && usernameCheck.suggestions.length > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          Suggestions:{" "}
                          {usernameCheck.suggestions.map((suggestion, index) => (
                            <span key={suggestion}>
                              <button
                                type="button"
                                onClick={() => applySuggestion(suggestion)}
                                className="text-green-600 font-medium cursor-pointer hover:underline"
                              >
                                {suggestion}
                              </button>
                              {index < usernameCheck.suggestions!.length - 1 && ", "}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {usernameCheck && usernameCheck.available && (
                    <div className="mt-2 text-sm text-green-600 flex items-center">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Username available
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="userType">User Type</Label>
                  <Select onValueChange={(value) => signupForm.setValue("userType", value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sports Fan">Sports Fan</SelectItem>
                      <SelectItem value="Athlete">Athlete</SelectItem>
                    </SelectContent>
                  </Select>
                  {signupForm.formState.errors.userType && (
                    <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.userType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    {...signupForm.register("email", {
                      onChange: (e) => {
                        const value = e.target.value;
                        if (value.includes("@")) {
                          checkEmail(value);
                        } else {
                          setEmailCheck(null);
                        }
                      },
                    })}
                    className="mt-2"
                  />
                  {signupForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.email.message}</p>
                  )}
                  
                  {isCheckingEmail && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Checking availability...
                    </div>
                  )}
                  
                  {emailCheck && !emailCheck.available && (
                    <div className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      Email already registered
                    </div>
                  )}
                  
                  {emailCheck && emailCheck.available && (
                    <div className="mt-2 text-sm text-green-600 flex items-center">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Email available
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="10-digit phone number"
                    pattern="[0-9]{10}"
                    {...signupForm.register("phone", {
                      onChange: (e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        signupForm.setValue("phone", value);
                        if (value.length === 10) {
                          checkPhone(value);
                        } else {
                          setPhoneCheck(null);
                        }
                      },
                    })}
                    className="mt-2"
                  />
                  <div className="text-xs text-gray-500 mt-1">Must be exactly 10 digits</div>
                  {signupForm.formState.errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.phone.message}</p>
                  )}
                  
                  {isCheckingPhone && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      Checking availability...
                    </div>
                  )}
                  
                  {phoneCheck && !phoneCheck.available && (
                    <div className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      Phone number already registered
                    </div>
                  )}
                  
                  {phoneCheck && phoneCheck.available && (
                    <div className="mt-2 text-sm text-green-600 flex items-center">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Phone number available
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    {...signupForm.register("password")}
                    className="mt-2"
                  />
                  {signupForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    {...signupForm.register("confirmPassword")}
                    className="mt-2"
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Terms Checkbox for Mobile Signup */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTermsMobileSignup"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  />
                  <Label htmlFor="acceptTermsMobileSignup" className="text-sm leading-relaxed">
                    I accept the{" "}
                    <Button
                      variant="link"
                      type="button"
                      className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium underline"
                      onClick={() => setLocation("/terms")}
                    >
                      Terms and Conditions
                    </Button>
                    {" "}and{" "}
                    <Button
                      variant="link"
                      type="button"
                      className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium underline"
                      onClick={() => setLocation("/privacy")}
                    >
                      Privacy Policy
                    </Button>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                  disabled={registerMutation.isPending || !acceptTerms}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                    >
                      Sign in here
                    </Button>
                  </p>
                </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mobile Sports Visual Below */}
          <div className="px-6 pb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-3 text-white">
                  <Upload className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-xs font-semibold">Upload Talent</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-3 text-white">
                  <Users className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-xs font-semibold">Apply Tryouts</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-3 text-white">
                  <PlayCircle className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-xs font-semibold">Drill Videos</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 text-white">
                  <Newspaper className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-xs font-semibold">Sports News</p>
                </div>
              </div>
              
              {/* Points to Money Card - Mobile Full Width */}
              <div className="mb-4">
                <div className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-center mb-2">
                    <Coins className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-bold text-center">Turn points into real money once eligible!</p>
                </div>
              </div>
              <p className="text-white/80 text-sm">
                Join the ultimate sports community
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <div className="relative z-10 min-h-screen flex">
          {/* Left Side - Welcome and Sports Visuals */}
          <div className="flex-1 flex flex-col justify-center items-center px-12 py-8">
            <div className="max-w-lg text-center">
              <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {isLogin ? "Welcome Back" : "Welcome to"}
              </h1>
              <h2 className="text-6xl font-bold mb-8" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                <span className="text-white">SPORTS</span>
                <span className="text-yellow-300">APP</span>
              </h2>
              
              {/* Sports Action Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-5 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  <Upload className="h-10 w-10 mx-auto mb-3" />
                  <h3 className="font-bold text-base mb-1">Upload Talent</h3>
                  <p className="text-xs opacity-90">Showcase your skills</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-5 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  <Users className="h-10 w-10 mx-auto mb-3" />
                  <h3 className="font-bold text-base mb-1">Apply Tryouts</h3>
                  <p className="text-xs opacity-90">Join competitions</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-5 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  <PlayCircle className="h-10 w-10 mx-auto mb-3" />
                  <h3 className="font-bold text-base mb-1">Drill Videos</h3>
                  <p className="text-xs opacity-90">Enhance your skills</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  <Newspaper className="h-10 w-10 mx-auto mb-3" />
                  <h3 className="font-bold text-base mb-1">Sports News</h3>
                  <p className="text-xs opacity-90">Stay updated</p>
                </div>
              </div>
              
              {/* Points to Money Card - Full Width */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 rounded-2xl p-6 text-white transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex items-center justify-center mb-3">
                    <Coins className="h-12 w-12" />
                  </div>
                  <h3 className="font-bold text-lg text-center mb-2">Turn points into real money once eligible!</h3>
                </div>
              </div>
              
              <p className="text-lg text-blue-100 font-medium">
                {isLogin 
                  ? "Ready to dive back into the action?" 
                  : "Join athletes and sports fans worldwide"
                }
              </p>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="w-1/2 max-w-lg flex items-center justify-center px-8 pr-12">
            <Card className="w-full shadow-2xl bg-white/95 backdrop-blur-sm border-0">
              <CardContent className="p-8">
                {/* Logo Above Form */}
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <span className="text-blue-600">SPORTS</span>
                    <span className="text-red-500">APP</span>
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {isLogin ? "Sign in to continue" : "Create your account"}
                  </p>
                </div>

                {isLogin ? (
                  /* Desktop Login Form */
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-3">
                    <div>
                      <Label htmlFor="loginUsername">Username</Label>
                      <Input
                        id="loginUsername"
                        type="text"
                        placeholder="Enter your username"
                        {...loginForm.register("username")}
                        className="mt-2"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="loginPassword">Password</Label>
                      <Input
                        id="loginPassword"
                        type="password"
                        placeholder="Enter your password"
                        {...loginForm.register("password")}
                        className="mt-2"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end mt-2">
                      <Button variant="ghost" type="button" className="text-sm text-blue-600 hover:text-blue-700">
                        Forgot Password?
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 mt-4"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() => setIsLogin(false)}
                          className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                        >
                          Create one here
                        </Button>
                      </p>
                    </div>
                  </form>
                ) : (
                  /* Desktop Signup Form */
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-3">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        {...signupForm.register("fullName")}
                        className="mt-2"
                      />
                      {signupForm.formState.errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Choose a unique username"
                        {...signupForm.register("username", {
                          onChange: (e) => {
                            const value = e.target.value;
                            if (value.length >= 3) {
                              checkUsername(value);
                            } else {
                              setUsernameCheck(null);
                            }
                          },
                        })}
                        className="mt-2"
                      />
                      {signupForm.formState.errors.username && (
                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.username.message}</p>
                      )}
                      
                      {isCheckingUsername && (
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          Checking availability...
                        </div>
                      )}
                      
                      {usernameCheck && !usernameCheck.available && (
                        <div className="mt-2">
                          <div className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="mr-1 h-4 w-4" />
                            Username already taken
                          </div>
                          {usernameCheck.suggestions && usernameCheck.suggestions.length > 0 && (
                            <div className="text-sm text-gray-600 mt-1">
                              Suggestions:{" "}
                              {usernameCheck.suggestions.map((suggestion, index) => (
                                <span key={suggestion}>
                                  <button
                                    type="button"
                                    onClick={() => applySuggestion(suggestion)}
                                    className="text-green-600 font-medium cursor-pointer hover:underline"
                                  >
                                    {suggestion}
                                  </button>
                                  {index < usernameCheck.suggestions!.length - 1 && ", "}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {usernameCheck && usernameCheck.available && (
                        <div className="mt-2 text-sm text-green-600 flex items-center">
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Username available
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="userType">User Type</Label>
                      <Select onValueChange={(value) => signupForm.setValue("userType", value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sports Fan">Sports Fan</SelectItem>
                          <SelectItem value="Athlete">Athlete</SelectItem>
                        </SelectContent>
                      </Select>
                      {signupForm.formState.errors.userType && (
                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.userType.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        {...signupForm.register("email", {
                          onChange: (e) => {
                            const value = e.target.value;
                            if (value.includes("@") && value.includes(".")) {
                              checkEmail(value);
                            } else {
                              setEmailCheck(null);
                            }
                          },
                        })}
                        className="mt-2"
                      />
                      {signupForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.email.message}</p>
                      )}
                      
                      {isCheckingEmail && (
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          Checking availability...
                        </div>
                      )}
                      
                      {emailCheck && !emailCheck.available && (
                        <div className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="mr-1 h-4 w-4" />
                          Email already registered
                        </div>
                      )}
                      
                      {emailCheck && emailCheck.available && (
                        <div className="mt-2 text-sm text-green-600 flex items-center">
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Email available
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="10-digit phone number"
                        pattern="[0-9]{10}"
                        {...signupForm.register("phone", {
                          onChange: (e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            signupForm.setValue("phone", value);
                            if (value.length === 10) {
                              checkPhone(value);
                            } else {
                              setPhoneCheck(null);
                            }
                          },
                        })}
                        className="mt-2"
                      />
                      <div className="text-xs text-gray-500 mt-1">Must be exactly 10 digits</div>
                      {signupForm.formState.errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.phone.message}</p>
                      )}
                      
                      {isCheckingPhone && (
                        <div className="mt-2 flex items-center text-sm text-gray-600">
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          Checking availability...
                        </div>
                      )}
                      
                      {phoneCheck && !phoneCheck.available && (
                        <div className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="mr-1 h-4 w-4" />
                          Phone number already registered
                        </div>
                      )}
                      
                      {phoneCheck && phoneCheck.available && (
                        <div className="mt-2 text-sm text-green-600 flex items-center">
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Phone number available
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        {...signupForm.register("password")}
                        className="mt-2"
                      />
                      {signupForm.formState.errors.password && (
                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        {...signupForm.register("confirmPassword")}
                        className="mt-2"
                      />
                      {signupForm.formState.errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{signupForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    {/* Terms Checkbox for Signup */}
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="acceptTermsSignup"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                      />
                      <Label htmlFor="acceptTermsSignup" className="text-sm leading-relaxed">
                        I accept the{" "}
                        <Button
                          variant="link"
                          type="button"
                          className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium underline"
                          onClick={() => setLocation("/terms")}
                        >
                          Terms and Conditions
                        </Button>
                        {" "}and{" "}
                        <Button
                          variant="link"
                          type="button"
                          className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium underline"
                          onClick={() => setLocation("/privacy")}
                        >
                          Privacy Policy
                        </Button>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                      disabled={registerMutation.isPending || !acceptTerms}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <Button
                          variant="ghost"
                          type="button"
                          onClick={() => setIsLogin(true)}
                          className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                        >
                          Sign in here
                        </Button>
                      </p>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
