import { ReactNode } from "react";

interface ExperienceCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const ExperienceCard = ({ title, icon, children, className = "" }: ExperienceCardProps) => {
  return (
    <section className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        {icon && <div className="text-gold">{icon}</div>}
        <h2 className="font-display text-xl text-foreground">{title}</h2>
      </div>
      <div className="gold-rule" />
      <div className="flex-1">{children}</div>
    </section>
  );
};

export default ExperienceCard;
