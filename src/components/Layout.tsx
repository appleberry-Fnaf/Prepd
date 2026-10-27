import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import HalloweenCursor from './HalloweenCursor';
import { CandyProvider } from '../context/CandyContext';

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const pageTransition = { duration: 0.26, ease: [0.22, 1, 0.36, 1] as const };

export default function Layout() {
  const location = useLocation();

  return (
    <CandyProvider>
      <div className="dk-page" style={{ paddingTop: '60px' }}>
        <HalloweenCursor />
        <Navbar />
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
        <Footer />
      </div>
    </CandyProvider>
  );
}
