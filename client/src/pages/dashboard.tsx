import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { LogOut, Upload, Server, Activity, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BotCard } from "@/components/bot-card";
import { UploadDialog } from "@/components/upload-dialog";
import { type Bot } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [uploadOpen, setUploadOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const code = localStorage.getItem("dpx_access_code");
    if (!code) {
      setLocation("/");
    }
  }, [setLocation]);

  const { data: bots = [], isLoading } = useQuery<Bot[]>({
    queryKey: ["/api/bots"],
    refetchInterval: 3000,
  });

  const handleLogout = () => {
    localStorage.removeItem("dpx_access_code");
    setLocation("/");
  };

  const runningBots = bots.filter(bot => bot.status === "running").length;
  const stoppedBots = bots.filter(bot => bot.status === "stopped").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">DPX Bot Hosting</h1>
                <p className="text-xs text-muted-foreground">Professional Bot Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setUploadOpen(true)}
                data-testid="button-upload-bot"
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Bot
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                data-testid="button-logout"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card/50 border-border/50">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bots</p>
                  <p className="text-3xl font-bold text-foreground mt-1" data-testid="text-total-bots">
                    {bots.length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Server className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-card/50 border-chart-2/20">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Running</p>
                  <p className="text-3xl font-bold text-chart-2 mt-1" data-testid="text-running-bots">
                    {runningBots}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-chart-2" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-card/50 border-muted-foreground/20">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stopped</p>
                  <p className="text-3xl font-bold text-muted-foreground mt-1" data-testid="text-stopped-bots">
                    {stoppedBots}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-muted/30 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-muted/30 rounded w-1/3" />
                  <div className="h-4 bg-muted/20 rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : bots.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2">
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Server className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">No Bots Yet</h3>
                <p className="text-muted-foreground">
                  Upload your first Telegram bot to get started. We'll handle the rest!
                </p>
              </div>
              <Button
                onClick={() => setUploadOpen(true)}
                data-testid="button-upload-first-bot"
                className="gap-2 mt-2"
              >
                <Upload className="h-4 w-4" />
                Upload Your First Bot
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Your Bots</h2>
            <div className="grid grid-cols-1 gap-4">
              {bots.map((bot) => (
                <BotCard key={bot.id} bot={bot} />
              ))}
            </div>
          </div>
        )}
      </main>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border bg-card ${className}`}>
      {children}
    </div>
  );
}
