"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface Setting {
  _id: string;
  key: string;
  value: any;
  description: string;
  type: "string" | "number" | "boolean";
}

export default function SettingsPage() {
  const { token } = useAuth();
  const [settings, setSettings] = React.useState<Setting[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const fetchSettings = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await adminApi.getSettings(token);
      if (res.success) {
        setSettings(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      const updates = settings.map(({ key, value }) => ({ key, value }));
      await adminApi.updateSettings(token, updates);
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Failed to update settings", error);
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((setting) => {
        if (setting.key === key) {
          let newValue: any = value;
          if (setting.type === "number") {
            newValue = parseFloat(value);
          } else if (setting.type === "boolean") {
            newValue = value === "true";
          }
          return { ...setting, value: newValue };
        }
        return setting;
      })
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>General Configuration</CardTitle>
            <CardDescription>
              Manage global application settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {settings.map((setting) => (
              <div key={setting._id} className="grid gap-2">
                <Label htmlFor={setting.key} className="capitalize">
                  {setting.key.replace(/_/g, " ")}
                </Label>
                <div className="flex flex-col gap-1">
                  {setting.type === "boolean" ? (
                    <select
                      id={setting.key}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={String(setting.value)}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : (
                    <Input
                      id={setting.key}
                      type={setting.type === "number" ? "number" : "text"}
                      value={setting.value}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      step={setting.type === "number" ? "0.01" : undefined}
                    />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}