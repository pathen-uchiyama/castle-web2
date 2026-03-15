interface CollectionHeaderProps {
  title: string;
  subtitle?: string;
}

const CollectionHeader = ({ title, subtitle }: CollectionHeaderProps) => (
  <div className="mb-6 mt-14 first:mt-0">
    <div className="flex items-center gap-3 mb-1">
      <div className="w-1.5 h-1.5 rounded-full bg-gold sparkle" />
      <h3 className="label-text text-gold-dark">{title}</h3>
    </div>
    {subtitle && <p className="text-sm text-muted-foreground ml-[18px]">{subtitle}</p>}
  </div>
);

export default CollectionHeader;
