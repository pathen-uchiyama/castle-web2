interface CollectionHeaderProps {
  title: string;
  subtitle?: string;
}

const CollectionHeader = ({ title, subtitle }: CollectionHeaderProps) => (
  <div className="mb-16 mt-24 first:mt-0">
    {/* Editorial divider — thin line */}
    <div className="h-px w-full bg-slate-plaid/15 mb-12" />
    <div className="flex items-center gap-3 mb-3">
      <span className="gold-leaf sparkle" />
      <h3 className="label-text text-gold tracking-[0.15em]">{title}</h3>
    </div>
    {subtitle && (
      <p className="font-editorial text-base text-muted-foreground italic">{subtitle}</p>
    )}
  </div>
);

export default CollectionHeader;
