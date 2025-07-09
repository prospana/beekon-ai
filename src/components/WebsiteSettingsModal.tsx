import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Globe,
  Settings,
  BarChart3,
  Zap,
  Bell,
  Shield,
  Download,
} from "lucide-react";
import type { Website } from "@/types/website";

// Form validation schema
const websiteSettingsSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  domain: z.string(),
  status: z.enum(["active", "pending", "paused"]),
  description: z.string().optional(),
  analysisFrequency: z.enum(["daily", "weekly", "bi-weekly", "monthly"]),
  autoAnalysis: z.boolean(),
  notifications: z.boolean(),
  competitorTracking: z.boolean(),
  weeklyReports: z.boolean(),
  showInDashboard: z.boolean(),
  priorityLevel: z.enum(["high", "medium", "low"]),
  customLabels: z.string().optional(),
  apiAccess: z.boolean(),
  dataRetention: z.enum(["30", "90", "180", "365"]),
  exportEnabled: z.boolean(),
});

type WebsiteSettingsFormData = z.infer<typeof websiteSettingsSchema>;


interface WebsiteSettingsModalProps {
  website: Website | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WebsiteSettingsModal({
  website,
  isOpen,
  onClose,
}: WebsiteSettingsModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm<WebsiteSettingsFormData>({
    resolver: zodResolver(websiteSettingsSchema),
    defaultValues: {
      displayName: website?.displayName || "",
      domain: website?.domain || "",
      status: website?.status || "active",
      description: "",
      analysisFrequency: "weekly",
      autoAnalysis: true,
      notifications: true,
      competitorTracking: false,
      weeklyReports: true,
      showInDashboard: true,
      priorityLevel: "medium",
      customLabels: "",
      apiAccess: false,
      dataRetention: "90",
      exportEnabled: true,
    },
  });

  const onSubmit = (data: WebsiteSettingsFormData) => {
    // TODO: Implement API call to save settings
    
    toast({
      title: "Settings saved",
      description: `Settings for ${data.displayName} have been updated successfully.`,
    });
    
    onClose();
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  if (!website) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-xl font-semibold">{website.displayName}</div>
              <div className="text-sm text-muted-foreground font-normal">
                {website.domain}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Configure monitoring settings and preferences for this website
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="display" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Display</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 max-h-[60vh] overflow-y-auto">
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                    <CardDescription>
                      Configure basic website information and status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          {...form.register("displayName")}
                          className="focus-ring"
                        />
                        {form.formState.errors.displayName && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.displayName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Input
                          id="domain"
                          {...form.register("domain")}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={form.watch("status")}
                        onValueChange={(value) => form.setValue("status", value as "active" | "pending" | "paused")}
                      >
                        <SelectTrigger className="focus-ring">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        {...form.register("description")}
                        placeholder="Add any notes or description for this website..."
                        className="focus-ring"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Analysis Settings</CardTitle>
                    <CardDescription>
                      Configure how often and how this website is analyzed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="analysisFrequency">Analysis Frequency</Label>
                      <Select
                        value={form.watch("analysisFrequency")}
                        onValueChange={(value) => form.setValue("analysisFrequency", value as "daily" | "weekly" | "bi-weekly" | "monthly")}
                      >
                        <SelectTrigger className="focus-ring">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Auto Analysis</Label>
                          <p className="text-sm text-muted-foreground">
                            Automatically analyze this website based on the frequency setting
                          </p>
                        </div>
                        <Switch
                          checked={form.watch("autoAnalysis")}
                          onCheckedChange={(checked) => form.setValue("autoAnalysis", checked)}
                          className="focus-ring"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Competitor Tracking</Label>
                          <p className="text-sm text-muted-foreground">
                            Include this website in competitive analysis reports
                          </p>
                        </div>
                        <Switch
                          checked={form.watch("competitorTracking")}
                          onCheckedChange={(checked) => form.setValue("competitorTracking", checked)}
                          className="focus-ring"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>Notification Settings</span>
                    </CardTitle>
                    <CardDescription>
                      Configure alerts and reports for this website
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Analysis Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when analysis is complete
                        </p>
                      </div>
                      <Switch
                        checked={form.watch("notifications")}
                        onCheckedChange={(checked) => form.setValue("notifications", checked)}
                        className="focus-ring"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive weekly performance summaries
                        </p>
                      </div>
                      <Switch
                        checked={form.watch("weeklyReports")}
                        onCheckedChange={(checked) => form.setValue("weeklyReports", checked)}
                        className="focus-ring"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="display" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Display Preferences</CardTitle>
                    <CardDescription>
                      Customize how this website appears in your dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">Show in Dashboard</Label>
                        <p className="text-sm text-muted-foreground">
                          Display this website's metrics on the main dashboard
                        </p>
                      </div>
                      <Switch
                        checked={form.watch("showInDashboard")}
                        onCheckedChange={(checked) => form.setValue("showInDashboard", checked)}
                        className="focus-ring"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="priorityLevel">Priority Level</Label>
                      <Select
                        value={form.watch("priorityLevel")}
                        onValueChange={(value) => form.setValue("priorityLevel", value as "high" | "medium" | "low")}
                      >
                        <SelectTrigger className="focus-ring">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="low">Low Priority</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Higher priority websites will be prominently displayed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customLabels">Custom Labels</Label>
                      <Input
                        id="customLabels"
                        {...form.register("customLabels")}
                        placeholder="e.g., main-site, blog, product-pages"
                        className="focus-ring"
                      />
                      <p className="text-sm text-muted-foreground">
                        Add custom labels separated by commas for better organization
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Advanced Settings</CardTitle>
                    <CardDescription>
                      Configure advanced features and data management
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">API Access</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow API access to this website's data
                        </p>
                      </div>
                      <Switch
                        checked={form.watch("apiAccess")}
                        onCheckedChange={(checked) => form.setValue("apiAccess", checked)}
                        className="focus-ring"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="dataRetention">Data Retention</Label>
                      <Select
                        value={form.watch("dataRetention")}
                        onValueChange={(value) => form.setValue("dataRetention", value as "30" | "90" | "180" | "365")}
                      >
                        <SelectTrigger className="focus-ring">
                          <SelectValue placeholder="Select retention period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">6 months</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        How long to keep historical analysis data
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-base font-medium flex items-center space-x-2">
                          <Download className="h-4 w-4" />
                          <span>Data Export</span>
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable data export functionality for this website
                        </p>
                      </div>
                      <Switch
                        checked={form.watch("exportEnabled")}
                        onCheckedChange={(checked) => form.setValue("exportEnabled", checked)}
                        className="focus-ring"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} className="focus-ring">
              Cancel
            </Button>
            <Button type="submit" className="focus-ring">
              Save Settings
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}