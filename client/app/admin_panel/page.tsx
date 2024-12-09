"use client";

import axios from "axios";
import { jsPDF } from "jspdf";
import { Download } from "lucide-react";
import { useState } from "react";

import BarChart from "@/components/admin_panel/barchart";
import { Barchart2 } from "@/components/admin_panel/Barchart2";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPanel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateAndDownloadReport = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        "http://localhost:5050/adminstat/generate-insightful-report",
        { prompt },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.report) {
        // Create PDF
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text("Session Data Analysis Report", 20, 20);

        // Add content
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(response.data.report, 170);
        doc.text(splitText, 20, 40);

        // Download PDF
        doc.save("session-analysis-report.pdf");
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="flex gap-4 items-center mb-6">
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 hover:shadow-xl"
          >
            <Download className="w-5 h-5 animate-bounce" />
            <span className="font-semibold">Download Report</span>
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Generate Report</DialogTitle>
              <DialogDescription>
                Enter a prompt to customize your report. Leave empty for default
                analysis.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prompt" className="text-right">
                  Prompt
                </Label>
                <Input
                  id="prompt"
                  placeholder="Optional prompt for analysis..."
                  className="col-span-3"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={generateAndDownloadReport}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isLoading ? "Generating..." : "Generate Report"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="w-full">
          <Tabs defaultValue="Analytics" className="w-[1000px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="Analytics">Total Meetings</TabsTrigger>
              <TabsTrigger value="day_graph">Meeting vs day</TabsTrigger>
            </TabsList>
            <TabsContent value="Analytics">
              <div className="col-span-2">
                <BarChart />
              </div>
            </TabsContent>
            <TabsContent value="day_graph">
              <Barchart2 />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
