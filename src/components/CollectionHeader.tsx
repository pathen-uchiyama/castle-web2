interface CollectionHeaderProps {
  title: string;
  subtitle?: string;
}

const CollectionHeader = ({ title, subtitle }: CollectionHeaderProps) => (
  <div className="mb-10 mt-20 first:mt-0 text-center">
    <div className="flex items-center justify-center gap-4 mb-3">
      <div className="h-px w-12 bg-gold/30" />
      <span className="gold-leaf sparkle" />
      <h3 className="label-text text-gold tracking-[0.15em]">{title}</h3>
      <span className="gold-leaf sparkle" />
      <div className="h-px w-12 bg-gold/30" />
    </div>
    {subtitle && (
      <p className="font-editorial text-base text-muted-foreground italic">{subtitle}</p>
    )}
  </div>
);

export default CollectionHeader;
