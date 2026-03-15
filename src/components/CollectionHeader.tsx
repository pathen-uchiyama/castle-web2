interface CollectionHeaderProps {
  title: string;
  subtitle?: string;
}

const CollectionHeader = ({ title, subtitle }: CollectionHeaderProps) => (
  <div className="mb-12 mt-40 first:mt-0">
    {/* Editorial divider — thin line */}
    <div className="h-px w-full bg-slate-plaid/15 mb-16" />
    <div className="flex items-center gap-3 mb-4">
      <span className="gold-leaf sparkle" />
      <div className="h-px w-8 bg-gold/30" />
    </div>
    <h3 className="font-display text-3xl sm:text-4xl text-foreground mb-3">{title}</h3>
    {subtitle && (
      <p className="font-editorial text-base text-muted-foreground italic">{subtitle}</p>
    )}
  </div>
);

export default CollectionHeader;
