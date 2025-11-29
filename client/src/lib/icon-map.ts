import {
  Brain,
  Lightbulb,
  Zap,
  Target,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BookOpen,
  Sparkles,
  Shield,
  Rocket,
  Heart,
  Award,
  Lock,
  Code,
  Calculator,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  brain: Brain,
  lightbulb: Lightbulb,
  zap: Zap,
  target: Target,
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  'trending-up': TrendingUp,
  'book-open': BookOpen,
  sparkles: Sparkles,
  shield: Shield,
  rocket: Rocket,
  heart: Heart,
  award: Award,
  lock: Lock,
  code: Code,
  calculator: Calculator,
};

export function getIconComponent(iconName: string) {
  return iconMap[iconName.toLowerCase()] || Lightbulb;
}
