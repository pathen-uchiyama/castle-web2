interface CollectionHeaderProps {
  title: string;
  subtitle?: string;
}

const CollectionHeader = ({ title, subtitle }: CollectionHeaderProps) => (
  <div className="mb-6 mt-12 first:mt-0">
    <h3 className="label-text mb-1">{title}</h3>
    {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
  </div>
);

export default CollectionHeader;
