import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col gap-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-2">
          This module is currently under development.
        </p>
      </div>

      <Card className="flex-1 flex items-center justify-center border-dashed bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Wrench className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground max-w-md">
            The {title} functionality is being actively built. Please check back in a future update!
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
