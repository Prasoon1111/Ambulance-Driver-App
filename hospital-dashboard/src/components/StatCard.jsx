import { motion } from 'framer-motion';

function StatCard({ icon: Icon, label, value, helper, tone = 'emergency', onClick }) {
  return (
    <motion.article
      className={`stat-card glass-card ${tone} ${onClick ? 'selectable' : ''}`}
      whileHover={{ y: -6, scale: 1.015 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-icon">{Icon ? <Icon /> : null}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{helper}</span>
      </div>
    </motion.article>
  );
}

export default StatCard;