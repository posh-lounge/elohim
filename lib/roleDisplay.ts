import { Crown, Briefcase, ChefHat, Beer, Building2, Users, Truck, ClipboardList, type LucideIcon } from 'lucide-react';
import type { RoleKey } from './types';

export const ROLE_ICON: Record<RoleKey, LucideIcon> = {
  owner: Crown,
  ops_manager: Briefcase,
  restaurant_gm: ChefHat,
  bar_manager: Beer,
  apartment_manager: Building2,
  recruitment_specialist: Users,
  logistics_coordinator: Truck,
  personal_assistant: ClipboardList,
};

// Tailwind class fragments (text/border/bg) keyed by the department accent
// each role belongs to. Kept as whole class names (not built with string
// concatenation) so Tailwind's compiler can see and generate them.
export const ROLE_ACCENT: Record<RoleKey, { text: string; border: string; bg: string; softBg: string }> = {
  owner:                   { text: 'text-gold',        border: 'border-gold',        bg: 'bg-gold',        softBg: 'bg-gold-soft' },
  ops_manager:             { text: 'text-gold',        border: 'border-gold',        bg: 'bg-gold',        softBg: 'bg-gold-soft' },
  restaurant_gm:           { text: 'text-restaurant',  border: 'border-restaurant',  bg: 'bg-restaurant',  softBg: 'bg-restaurant-soft' },
  bar_manager:              { text: 'text-restaurant',  border: 'border-restaurant',  bg: 'bg-restaurant',  softBg: 'bg-restaurant-soft' },
  apartment_manager:        { text: 'text-apartments',  border: 'border-apartments',  bg: 'bg-apartments',  softBg: 'bg-apartments-soft' },
  recruitment_specialist:   { text: 'text-recruitment', border: 'border-recruitment', bg: 'bg-recruitment', softBg: 'bg-recruitment-soft' },
  logistics_coordinator:    { text: 'text-logistics',   border: 'border-logistics',   bg: 'bg-logistics',   softBg: 'bg-logistics-soft' },
  personal_assistant:       { text: 'text-office',      border: 'border-office',      bg: 'bg-office',      softBg: 'bg-office-soft' },
};

export const PRIORITY_ACCENT: Record<'low' | 'medium' | 'high', string> = {
  high: 'text-danger border-danger',
  medium: 'text-gold border-gold',
  low: 'text-success border-success',
};
