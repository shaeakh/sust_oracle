"use client";

import BarChart from "@/components/admin_panel/barchart";
import { Barchart2 } from "@/components/admin_panel/Barchart2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
