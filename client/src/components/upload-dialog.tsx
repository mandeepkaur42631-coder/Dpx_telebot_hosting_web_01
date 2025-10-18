import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, File, X, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [botName, setBotName] = useState("");
  const [botFile, setBotFile] = useState<File | null>(null);
  const [requirementsFile, setRequirementsFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reqInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/bots/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      toast({
        title: "Bot Uploaded Successfully",
        description: "Your bot is ready to run. Dependencies will be installed automatically.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload bot. Please try again.",
      });
    },
  });

  const handleClose = () => {
    setBotName("");
    setBotFile(null);
    setRequirementsFile(null);
    onOpenChange(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const pyFile = files.find(f => f.name.endsWith(".py"));
    const reqFile = files.find(f => f.name === "requirements.txt");

    if (pyFile) setBotFile(pyFile);
    if (reqFile) setRequirementsFile(reqFile);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!botName || !botFile) return;

    const formData = new FormData();
    formData.append("name", botName);
    formData.append("botFile", botFile);
    if (requirementsFile) {
      formData.append("requirementsFile", requirementsFile);
    }

    uploadMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upload Telegram Bot</DialogTitle>
          <DialogDescription>
            Upload your Bot.py file and optional requirements.txt. Dependencies will be installed automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bot-name">Bot Name</Label>
            <Input
              id="bot-name"
              data-testid="input-bot-name"
              placeholder="My Awesome Bot"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover-elevate"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground mb-2">
                Drop your files here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Upload Bot.py and optional requirements.txt
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".py"
                onChange={(e) => e.target.files?.[0] && setBotFile(e.target.files[0])}
                className="hidden"
                data-testid="input-bot-file"
              />
              <input
                ref={reqInputRef}
                type="file"
                accept=".txt"
                onChange={(e) => e.target.files?.[0] && setRequirementsFile(e.target.files[0])}
                className="hidden"
                data-testid="input-requirements-file"
              />
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select Bot.py
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => reqInputRef.current?.click()}
                >
                  Select requirements.txt
                </Button>
              </div>
            </div>

            {(botFile || requirementsFile) && (
              <div className="space-y-2">
                {botFile && (
                  <div className="flex items-center gap-3 p-3 rounded-md bg-primary/5 border border-primary/20">
                    <File className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-mono flex-1 truncate">{botFile.name}</span>
                    <CheckCircle className="h-4 w-4 text-chart-2" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setBotFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {requirementsFile && (
                  <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30 border border-border">
                    <File className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-mono flex-1 truncate">{requirementsFile.name}</span>
                    <CheckCircle className="h-4 w-4 text-chart-2" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => setRequirementsFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="button-submit-upload"
              disabled={!botName || !botFile || uploadMutation.isPending}
              className="gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Bot
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
