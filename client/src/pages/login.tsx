// client/src/pages/Login.tsx
import { auth, provider } from '../firebaseConfig';
import { signInWithPopup } from "firebase/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Server, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // Login successful, user ko dashboard par bhejein
        setLocation("/dashboard");
      })
      .catch((error) => {
        console.error("Login failed:", error);
        alert("Google Login Failed. Please try again.");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <Card className="w-full max-w-md relative z-10 border-primary/20 shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Server className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              DPX Bot Hosting
            </CardTitle>
            <CardDescription className="text-base">
              Professional Telegram Bot Hosting Platform
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGoogleLogin}
            className="w-full h-12 text-base font-semibold"
          >
            Login with Google
          </Button>
          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Need help?
            </p>
            <a
              href="https://t.me/Dpx_army_ff_01"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-primary hover-elevate active-elevate-2 p-3 rounded-md border border-primary/20 transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="font-medium">Contact on Telegram</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
