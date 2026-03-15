import { ReactNode } from "react";

interface ExperienceCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const ExperienceCard = ({ title, icon, children, className = "" }: ExperienceCardProps) => {
  return (
    <section className={`flex flex-col gap-6 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && <div className="text-gold/60">{icon}</div>}
        <h2 className="font-display text-lg text-foreground">{title}</h2>
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
};

export default ExperienceCard;
