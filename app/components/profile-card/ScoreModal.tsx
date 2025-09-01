
export function ScoreModal({ breakdown, onClose }: { breakdown?: { [key: string]: number }, onClose: () => void }) {

  if (!breakdown) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Full Aura Report</h3>
            <button className="close-button" onClick={onClose}>X</button>
          </div>
          <div className="modal-body">
            <p>Detailed breakdown not available for this user.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Full Aura Report</h3>
          <button className="close-button" onClick={onClose}>
            X
          </button>
        </div>
        <div className="modal-body">
          {Object.entries(breakdown).map(([key, value]) => (
            <div className="report-row" key={key}>
              <span className="report-label">{key.replace('_', ' ')}</span>
              <div className="report-dots"></div>
              <span className="report-score">{parseFloat(Number(value).toFixed(1))} / 20</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
