import { Link } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { CosmicButton } from "@/components/ui/cosmic-button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black/90 p-4">
      <GlassCard className="max-w-md w-full text-center py-12">
        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Lost in Space?</h1>
        <p className="text-white/60 mb-8">
          The page you are looking for seems to have drifted into a black hole.
        </p>

        <Link href="/">
          <CosmicButton className="w-full">
            Return to Earth
          </CosmicButton>
        </Link>
      </GlassCard>
    </div>
  );
}
