import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useCreateUser } from "@/hooks/use-oracool";
import { GlassCard } from "@/components/ui/glass-card";
import { CosmicButton } from "@/components/ui/cosmic-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, MapPin, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";

// Extend schema for form validation
const formSchema = insertUserSchema.extend({
  birthDate: z.string().min(1, "Birth date is required"),
  birthTime: z.string().min(1, "Birth time is required"),
  birthCity: z.string().min(1, "Birth city is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Welcome() {
  const createUser = useCreateUser();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: FormValues) => {
    createUser.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-6 shadow-xl"
          >
            <Sparkles className="w-8 h-8 text-pink-400" />
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            <span className="text-white">Ora</span>
            <span className="text-gradient">cool</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 font-light">
            Your Personal Cosmic Blueprint
          </p>
        </div>

        <GlassCard className="border-t border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="text-white/80 text-sm font-medium ml-1">
                Date of Birth
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 w-5 h-5 text-white/40 pointer-events-none" />
                <Input
                  id="birthDate"
                  type="date"
                  className="glass-input pl-11 h-12 text-base"
                  {...register("birthDate")}
                />
              </div>
              {errors.birthDate && (
                <span className="text-red-400 text-xs ml-1">{errors.birthDate.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthTime" className="text-white/80 text-sm font-medium ml-1">
                Time of Birth
              </Label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3.5 w-5 h-5 text-white/40 pointer-events-none" />
                <Input
                  id="birthTime"
                  type="time"
                  className="glass-input pl-11 h-12 text-base"
                  {...register("birthTime")}
                />
              </div>
              {errors.birthTime && (
                <span className="text-red-400 text-xs ml-1">{errors.birthTime.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthCity" className="text-white/80 text-sm font-medium ml-1">
                Place of Birth
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-5 h-5 text-white/40 pointer-events-none" />
                <Input
                  id="birthCity"
                  type="text"
                  placeholder="e.g. New York, NY"
                  className="glass-input pl-11 h-12 text-base placeholder:text-white/20"
                  {...register("birthCity")}
                />
              </div>
              {errors.birthCity && (
                <span className="text-red-400 text-xs ml-1">{errors.birthCity.message}</span>
              )}
            </div>

            <CosmicButton
              type="submit"
              className="w-full mt-4 h-14 text-lg"
              isLoading={createUser.isPending}
            >
              Create My Blueprint ✨
            </CosmicButton>
          </form>
        </GlassCard>

        <p className="text-center text-white/30 text-xs mt-8">
          By connecting with the stars, you accept our Terms of Service.
        </p>
      </motion.div>
    </div>
  );
}
