import { motion } from 'framer-motion';
import { FiRadio, FiAlertTriangle, FiCheckCircle, FiWifiOff } from 'react-icons/fi';

/**
 * Alert Banner Component
 * Displays system status and critical alerts with contextual styling
 *
 * @param {string} message - Alert message to display
 * @param {string} type - Alert type: 'info', 'critical', 'success', 'warning', 'disconnected'
 */
function AlertBanner({ message, type = 'info' }) {
  // Determine icon and styling based on type
  const getAlertConfig = (alertType) => {
    switch (alertType) {
      case 'critical':
        return {
          icon: FiAlertTriangle,
          className: 'alert-banner alert-critical',
          color: '#c71f1f',
        };
      case 'success':
        return {
          icon: FiCheckCircle,
          className: 'alert-banner alert-success',
          color: '#127c4b',
        };
      case 'warning':
        return {
          icon: FiAlertTriangle,
          className: 'alert-banner alert-warning',
          color: '#b45309',
        };
      case 'disconnected':
        return {
          icon: FiWifiOff,
          className: 'alert-banner alert-disconnected',
          color: '#9d174d',
        };
      default:
        return {
          icon: FiRadio,
          className: 'alert-banner alert-info',
          color: '#1f2937',
        };
    }
  };

  const config = getAlertConfig(type);
  const Icon = config.icon;

  return (
    <motion.div
      className={config.className}
      initial={{ opacity: 0, y: -12 }}
      animate={type === 'critical' ? { opacity: [1, 0.78, 1], y: 0 } : { opacity: 1, y: 0 }}
      transition={type === 'critical' ? { duration: 2, repeat: Infinity } : { duration: 0.3 }}
    >
      <Icon color={config.color} />
      <span>{message}</span>
    </motion.div>
  );
}

export default AlertBanner;
