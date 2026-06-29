import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input } from 'antd';
import { FiLock, FiMail, FiRadio } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const cardVariants = {
    hidden: { opacity: 0, y: 34, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.55,
        ease: 'easeOut',
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }

    try {
      setLoading(true);

      const signedInUser = await login(email.trim(), password);
      const roleHome = {
        admin: '/admin/approvals',
        super_admin: '/admin/approvals',
        hospital_admin: '/dashboard',
        driver: '/driver',
      };

      navigate(roleHome[signedInUser.role] || '/dashboard', { replace: true });
    } catch (authError) {
  setError(
    authError.message === 'Your account is pending admin approval.'
      ? authError.message
      : 'Unable to sign in. Check your email and password.'
  );
} finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-page">
      <motion.div
        className="login-card glass-card"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span className="login-badge" variants={itemVariants}>
          <FiRadio /> Emergency Command Center
        </motion.span>

        <motion.h1 variants={itemVariants}>National Healthcare Operations</motion.h1>

        <motion.p variants={itemVariants}>
          Sign in with your registered hospital dashboard account.
        </motion.p>

        <form onSubmit={handleSubmit}>
          <motion.div
            className="form-group animated-input"
            variants={itemVariants}
            whileFocus={{ scale: 1.01 }}
          >
            <label htmlFor="email">Email</label>

            <Input
              id="email"
              type="email"
              prefix={<FiMail />}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
              placeholder="your-email@gmail.com"
              required
              disabled={loading}
            />
          </motion.div>

          <motion.div
            className="form-group animated-input"
            variants={itemVariants}
            whileFocus={{ scale: 1.01 }}
          >
            <label htmlFor="password">Password</label>

            <Input.Password
              id="password"
              prefix={<FiLock />}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={loading ? {} : { y: -2, scale: 1.01 }}
            whileTap={loading ? {} : { scale: 0.98 }}
          >
            <Button
              htmlType="submit"
              className="button-primary"
              type="primary"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Access Command Center'}
            </Button>
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                color: '#ff4d4f',
                marginTop: '12px',
                fontSize: '14px',
              }}
            >
              {error}
            </motion.p>
          )}
        </form>
      </motion.div>
    </section>
  );
}

export default Login;