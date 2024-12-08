import { Barchart } from "@/components/analytics/BarChart";
import { Linechart } from "@/components/analytics/Linechart";
import { Pie_Chart } from "@/components/analytics/Pie_Chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
function page() {
  return (
    <div>
      <Tabs defaultValue="account" className="w-[600px]">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="Chart_1">Chart_1</TabsTrigger>
          <TabsTrigger value="Chart_2">Chart_2</TabsTrigger>
          <TabsTrigger value="Chart_3">Chart_3</TabsTrigger>
        </TabsList>
        <TabsContent value="Chart_1">
          <Card>
            <CardHeader>
              <CardTitle>Chart_1</CardTitle>
              <CardDescription>He he he</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Pie_Chart />
            </CardContent>
            <CardFooter>here is card footer</CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="Chart_2">
          <Card>
            <CardHeader>
              <CardTitle>Chart_2</CardTitle>
              <CardDescription>He he he</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Barchart />
            </CardContent>
            <CardFooter>here is card footer</CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="Chart_3">
          <Card>
            <CardHeader>
              <CardTitle>Chart_3</CardTitle>
              <CardDescription>He he he</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Linechart />
            </CardContent>
            <CardFooter>here is card footer</CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default page;