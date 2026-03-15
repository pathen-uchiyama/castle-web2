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
    <section className={`card-stationery flex flex-col gap-4 ${colSpan} ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl text-primary">{title}</h2>
        {icon && <div className="text-accent">{icon}</div>}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
};

export default ExperienceCard;
