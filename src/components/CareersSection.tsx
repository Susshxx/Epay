import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function CareersSection() {
  const navigate = useNavigate();

  return (
    <section className="flex w-full max-w-[420px] flex-col items-center gap-4 text-center">
      <img
        src="/image.png"
        alt=""
        className="absolute -top-14 -left-2 h-40 w-60 -rotate-90 hidden sm:block"
      /> 
      <motion.h2
        className="font-didot text-2xl text-red-600 sm:text-3xl underline decoration-2 underline-offset-4 drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => navigate('/careers')}
        style={{ cursor: 'pointer' }}
      >
        Careers
      </motion.h2>
    </section>
  );
}
