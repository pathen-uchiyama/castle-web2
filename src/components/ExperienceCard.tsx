import { ReactNode } from "react";

interface ExperienceCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  colSpan?: string;
}

const ExperienceCard = ({ title, icon, children, className = "", colSpan = "" }: ExperienceCardProps) => {
  return (
    <section className={`card-castle flex flex-col gap-3 ${colSpan} ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-foreground">{title}</h2>
        {icon && <div className="text-gold">{icon}</div>}
      </div>
      <div className="w-8 h-0.5 bg-gold/30 rounded-full" />
      <div className="flex-1">{children}</div>
    </section>
  );
};

export default ExperienceCard;
