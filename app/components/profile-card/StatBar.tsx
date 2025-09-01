
export function StatBar({ name, percentage, tier }: { name: string, percentage: number, tier: string }) {
  const tierClass = tier.toLowerCase();
  return (
    <div className="stat-row">
      <div className="stat-header">
        <span className="stat-name">{name}</span>
        <span className={`stat-tier ${tierClass}`}>{tier}</span>
      </div>
      <div className="stat-bar-container">
        <div className="stat-bar-progress" style={{ width: `${Math.min(percentage, 100)}%` }}>
        </div>
        <span className="stat-percentage">{percentage}%</span>
      </div>
    </div>
  );
}
