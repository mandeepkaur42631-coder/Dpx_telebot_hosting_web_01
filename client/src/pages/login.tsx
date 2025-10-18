import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Server, Lock, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/validate-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: accessCode }),
      });

      if (response.ok) {
        localStorage.setItem("dpx_access_code", accessCode);
        setLocation("/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Access Code",
          description: "Please check your access code and try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to validate access code. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
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
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="access-code" className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Access Code
              </Label>
              <Input
                id="access-code"
                data-testid="input-access-code"
                type="password"
                placeholder="Enter your access code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="h-12 text-base border-primary/20 focus:border-primary"
                required
              />
            </div>

            <Button
              type="submit"
              data-testid="button-login"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Validating..." : "Access Platform"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Don't have an access code?
            </p>
            <a
              href="https://t.me/Dpx_army_ff_01"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-buy-access"
              className="flex items-center justify-center gap-2 text-sm text-primary hover-elevate active-elevate-2 p-3 rounded-md border border-primary/20 transition-all"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="font-medium">Contact on Telegram to Buy Access</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
