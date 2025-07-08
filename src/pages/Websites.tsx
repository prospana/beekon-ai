import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import {
  Plus,
  Globe,
  MoreHorizontal,
  Settings,
  Trash2,
  BarChart3,
  Calendar,
  Play,
} from "lucide-react";
import { sendN8nWebhook } from "@/lib/http-request";
import { useAuth } from "@/hooks/useAuth";
import { WebsiteSettingsModal } from "@/components/WebsiteSettingsModal";
import type { Website } from "@/types/website";

export default function Websites() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [domain, setDomain] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [websiteToDelete, setWebsiteToDelete] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const { workspaceId } = useAuth();

  // Mock data with state for dynamic updates
  const [websites, setWebsites] = useState<Website[]>([
    {
      id: 1,
      domain: "example.com",
      displayName: "Example Corp",
      status: "active",
      lastAnalyzed: "2024-01-07",
      totalTopics: 12,
      avgVisibility: 78,
      analysisFrequency: "weekly",
      autoAnalysis: true,
      notifications: true,
      competitorTracking: false,
      weeklyReports: true,
      showInDashboard: true,
      priorityLevel: "high",
      apiAccess: false,
      dataRetention: "90",
      exportEnabled: true,
    },
    {
      id: 2,
      domain: "mycompany.io",
      displayName: "My Company",
      status: "pending",
      lastAnalyzed: "2024-01-05",
      totalTopics: 8,
      avgVisibility: 65,
      analysisFrequency: "weekly",
      autoAnalysis: true,
      notifications: true,
      competitorTracking: true,
      weeklyReports: false,
      showInDashboard: true,
      priorityLevel: "medium",
      apiAccess: false,
      dataRetention: "30",
      exportEnabled: false,
    },
    {
      id: 3,
      domain: "startup.tech",
      displayName: "Tech Startup",
      status: "active",
      lastAnalyzed: "2024-01-06",
      totalTopics: 15,
      avgVisibility: 82,
      analysisFrequency: "daily",
      autoAnalysis: true,
      notifications: false,
      competitorTracking: true,
      weeklyReports: true,
      showInDashboard: true,
      priorityLevel: "high",
      apiAccess: true,
      dataRetention: "365",
      exportEnabled: true,
    },
  ]);

  // Add `https://` if it doesn't exists
  const addProtocol = (domain: string) => {
    if (!domain.includes("https://")) return "https://" + domain;
    return domain;
  };

  const handleAddWebsite = async () => {
    setProcessing(true);
    if (!domain) {
      toast({
        title: "Error",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }

    if (!displayName) {
      toast({
        title: "Error",
        description: "Please enter a display name",
        variant: "destructive",
      });
      return;
    }

    // Validate domain format
    const domainRegex =
      /^(https?:\/\/)?([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

    if (!domainRegex.test(domain)) {
      toast({
        title: "Error",
        description: "Please enter a valid domain name",
        variant: "destructive",
      });
      return;
    }

    const response = await sendN8nWebhook("webhook/website-onboarding", {
      website: addProtocol(domain),
      display_name: displayName,
      workspace_id: workspaceId,
    });

    if (!response.success) {
      toast({
        title: "Error",
        description: "Website crawl failed. Ensure the site is accessible.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically make an API call to add the website
    toast({
      title: "Website added!",
      description: `Analysis started for ${domain}`,
    });

    setDomain("");
    setDisplayName("");
    setProcessing(false);
    setIsAddDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success">Active</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleOpenSettings = (website: Website) => {
    setSelectedWebsite(website);
    setIsSettingsModalOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsModalOpen(false);
    setSelectedWebsite(null);
  };

  const handleAnalyzeNow = async (websiteId: number) => {
    setIsAnalyzing(websiteId);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000));

      toast({
        title: "Analysis started",
        description:
          "Your website analysis has been queued and will begin shortly.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(null);
    }
  };

  const handleDeleteWebsite = async (websiteId: number) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setWebsites((prev) => prev.filter((site) => site.id !== websiteId));

      toast({
        title: "Website deleted",
        description: "The website has been removed from monitoring.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete website. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (websiteId: number) => {
    setWebsiteToDelete(websiteId);
    setShowDeleteConfirm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Websites</h1>
          <p className="text-muted-foreground">
            Manage and monitor your websites for AI visibility
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Website
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Website</DialogTitle>
              <DialogDescription>
                Add a website to start monitoring its AI visibility
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="https://www.example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name (Optional)</Label>
                <Input
                  id="displayName"
                  placeholder="My Company"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <LoadingButton
                onClick={handleAddWebsite}
                loading={processing}
                loadingText="Starting..."
                icon={<Play className="h-4 w-4" />}
              >
                Start Analysis
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty State */}
      {websites.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="mb-2">No websites added yet</CardTitle>
            <CardDescription className="mb-4">
              Add your first website to start monitoring its AI visibility
            </CardDescription>
            <LoadingButton
              onClick={() => setIsAddDialogOpen(true)}
              icon={<Plus className="h-4 w-4" />}
            >
              Add Your First Website
            </LoadingButton>
          </CardContent>
        </Card>
      )}

      {/* Websites Grid */}
      <div className="grid gap-6">
        {websites.map((website) => (
          <Card key={website.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {website.displayName || website.domain}
                    </CardTitle>
                    <CardDescription>{website.domain}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(website.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleAnalyzeNow(website.id)}
                        disabled={isAnalyzing === website.id}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        {isAnalyzing === website.id
                          ? "Analyzing..."
                          : "Analyze Now"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleOpenSettings(website)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => confirmDelete(website.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Analyzed</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(website.lastAnalyzed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Total Topics</p>
                    <p className="text-sm text-muted-foreground">
                      {website.totalTopics}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-primary rounded-full" />
                  <div>
                    <p className="text-sm font-medium">Avg Visibility</p>
                    <p className="text-sm text-muted-foreground">
                      {website.avgVisibility}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Website Settings Modal */}
      <WebsiteSettingsModal
        website={selectedWebsite}
        isOpen={isSettingsModalOpen}
        onClose={handleCloseSettings}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setWebsiteToDelete(null);
        }}
        onConfirm={() =>
          websiteToDelete && handleDeleteWebsite(websiteToDelete)
        }
        title="Delete Website"
        description="Are you sure you want to delete this website? This will remove all associated analysis data and cannot be undone."
        confirmText="Delete Website"
        variant="destructive"
      />
    </div>
  );
}
