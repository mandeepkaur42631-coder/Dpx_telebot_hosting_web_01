import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RefreshCw, Trash2, ChevronDown, ChevronUp, Terminal, FileCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Bot } from "@shared/schema";
import { format } from "date-fns";

interface BotCardProps {
  bot: Bot;
}

export function BotCard({ bot }: BotCardProps) {
  const [showLogs, setShowLogs] = useState(false);
  const { toast } = useToast();

  const startMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/bots/${bot.id}/start`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({ title: "Bot Started", description: `${bot.name} is now running.` });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to start bot." });
    },
  });

  const stopMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/bots/${bot.id}/stop`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({ title: "Bot Stopped", description: `${bot.name} has been stopped.` });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to stop bot." });
    },
  });

  const restartMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/bots/${bot.id}/restart`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({ title: "Bot Restarted", description: `${bot.name} is restarting.` });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to restart bot." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/bots/${bot.id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({ title: "Bot Deleted", description: `${bot.name} has been removed.` });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete bot." });
    },
  });

  const statusColor = bot.status === "running" ? "chart-2" : bot.status === "error" ? "destructive" : "muted-foreground";
  const statusBg = bot.status === "running" ? "chart-2/10" : bot.status === "error" ? "destructive/10" : "muted/30";

  return (
    <Card className={`border-l-4 ${bot.status === "running" ? "border-l-chart-2" : bot.status === "error" ? "border-l-destructive" : "border-l-muted-foreground"}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-foreground truncate" data-testid={`text-bot-name-${bot.id}`}>
                {bot.name}
              </h3>
              <Badge className={`bg-${statusBg} text-${statusColor} border-${statusColor}/20`} data-testid={`badge-status-${bot.id}`}>
                {bot.status === "running" && <span className="inline-block h-2 w-2 rounded-full bg-chart-2 mr-1.5 animate-pulse" />}
                {bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5" />
                <span className="font-mono">{bot.fileName}</span>
              </div>
              <div>
                Uploaded {format(new Date(bot.uploadedAt), "MMM d, yyyy")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {bot.status !== "running" && (
              <Button
                size="sm"
                onClick={() => startMutation.mutate()}
                disabled={startMutation.isPending}
                data-testid={`button-start-${bot.id}`}
                className="gap-1.5 bg-chart-2 hover:bg-chart-2/90 text-white"
              >
                <Play className="h-3.5 w-3.5" />
                Run
              </Button>
            )}
            {bot.status === "running" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => stopMutation.mutate()}
                disabled={stopMutation.isPending}
                data-testid={`button-stop-${bot.id}`}
                className="gap-1.5"
              >
                <Square className="h-3.5 w-3.5" />
                Stop
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => restartMutation.mutate()}
              disabled={restartMutation.isPending}
              data-testid={`button-restart-${bot.id}`}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Restart
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-${bot.id}`}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowLogs(!showLogs)}
              data-testid={`button-toggle-logs-${bot.id}`}
              className="gap-1.5"
            >
              <Terminal className="h-3.5 w-3.5" />
              {showLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {showLogs && (
        <CardContent className="pt-0">
          <div className="rounded-md bg-background/50 border border-border p-4 font-mono text-sm max-h-96 overflow-auto">
            {bot.logs ? (
              <pre className="text-foreground whitespace-pre-wrap" data-testid={`logs-${bot.id}`}>
                {bot.logs}
              </pre>
            ) : (
              <p className="text-muted-foreground italic">No logs available yet.</p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
