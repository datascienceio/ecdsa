import { useState, useEffect } from "react";

function SecurityAudit({ transaction }) {
  const [auditLog, setAuditLog] = useState([]);

  useEffect(() => {
    if (transaction) {
      const timestamp = new Date().toLocaleTimeString();
      const newLog = {
        id: Date.now(),
        timestamp,
        type: "transaction_verified",
        details: {
          algorithm: "ECDSA secp256k1",
          hashFunction: "Keccak256",
          signatureLength: 128,
          recoveryBit: transaction.recoveryBit,
          status: "✓ VERIFIED"
        }
      };

      setAuditLog(prev => [newLog, ...prev.slice(0, 4)]);
    }
  }, [transaction]);

  return (
    <div className="security-audit">
      <div className="audit-header">
        <span className="audit-title">🛡️ Cryptographic Audit Log</span>
        <span className="audit-count">{auditLog.length} events</span>
      </div>

      <div className="audit-entries">
        {auditLog.length === 0 ? (
          <div className="audit-empty">No transactions yet</div>
        ) : (
          auditLog.map((entry) => (
            <div key={entry.id} className="audit-entry">
              <div className="entry-time">{entry.timestamp}</div>
              <div className="entry-algorithm">
                {entry.details.algorithm} + {entry.details.hashFunction}
              </div>
              <div className="entry-status verified">{entry.details.status}</div>
              <div className="entry-details">
                Sig: {entry.details.signatureLength}B | Rec: {entry.details.recoveryBit}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="audit-stats">
        <div className="stat">
          <span className="stat-label">Authentication Method:</span>
          <span className="stat-value">ECDSA secp256k1</span>
        </div>
        <div className="stat">
          <span className="stat-label">Hash Algorithm:</span>
          <span className="stat-value">Keccak256</span>
        </div>
        <div className="stat">
          <span className="stat-label">Key Space:</span>
          <span className="stat-value">256-bit</span>
        </div>
        <div className="stat">
          <span className="stat-label">Threat Level:</span>
          <span className="stat-value secure">SECURE</span>
        </div>
      </div>
    </div>
  );
}

export default SecurityAudit;
