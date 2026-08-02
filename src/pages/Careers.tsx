import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { SendMoneyDialog } from '../components/SendMoneyDialog';
import { useFundingProgress } from '../hooks/useFundingProgress';

const openPositions = [
  {
    id: 1,
    title: '💼 Professional Beggar',
    department: 'Street Operations',
    location: 'Your Mom\'s Basement',
    type: 'Full-time (24/7)',
    description: '🎭 Perfect for people with zero shame! You\'ll master the ancient art of asking random internet strangers for money. Requirements: Puppy dog eyes, fake tears on demand, and the ability to guilt-trip your own grandmother. We provide the sad violin music! 🎻'
  },
  {
    id: 2,
    title: '✍️ Chief Sob Story Writer',
    department: 'Creative Lies... I mean Excuses',
    location: 'Remote (couch preferred)',
    type: 'Freelance',
    description: '📖 Write Oscar-worthy tales of misfortune! "My goldfish needs therapy" or "I spent all my money on avocado toast and now I\'m broke" - if you can make people cry AND laugh, you\'re hired! Bonus: Get paid to lie with style! 💅'
  },
  {
    id: 3,
    title: '📱 Digital Panhandler',
    department: 'Virtual Guilt Trips',
    location: 'Remote (WiFi stealing mandatory)',
    type: 'Gig Economy Victim',
    description: '🤳 Hold digital cardboard signs on Zoom! Send passive-aggressive Venmo requests to your rich cousin. Text "u up?" followed by "can I borrow $50?" to everyone at 2am. Must be comfortable being blocked by family members. 😅'
  },
  {
    id: 4,
    title: '🔮 Money Manifestation Guru',
    department: 'Hopes & Delusions',
    location: 'Astral Plane (WiFi available)',
    type: 'Delusional Optimist',
    description: '✨ Stare at empty wallet intensely until money appears! Refresh bank account 847 times daily (it might work!). Pray to the PayPal gods, sacrifice instant noodles to the algorithm. Experience in crying while checking balance preferred. 😭💸'
  }
];

export function Careers() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { recordDonation } = useFundingProgress();

  const handleJoinUs = () => {
    setIsDialogOpen(true);
  };

  return (
    <main className="w-full min-h-screen overflow-x-hidden bg-canvas">
      <div className="mx-auto flex max-w-[1000px] flex-col items-center gap-12 px-6 py-10 sm:gap-16 sm:px-10 sm:py-14">
        <div className="flex w-full max-w-[900px] flex-col gap-3 text-center">
          <motion.h1
            className="font-didot text-4xl text-black sm:text-5xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Careers
          </motion.h1>
          <motion.p
            className="font-jeju text-lg text-black/70 sm:text-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            💰 Help us beg professionally (we're broke and shameless) 💰
          </motion.p>
        </div>

        <div className="flex w-full max-w-[900px] flex-col gap-6">
          {openPositions.map((position, index) => (
            <motion.div
              key={position.id}
              className="flex flex-row gap-6 rounded-[8px] border-2 border-black bg-[#EAE8E8]/50 p-6 shadow-[3px_3px_0px_rgba(0,0,0,1)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex flex-1 flex-col">
                <h3 className="font-didot text-2xl text-black">{position.title}</h3>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-black/30 bg-white px-2 py-1 font-jeju text-xs text-black/70">
                    {position.department}
                  </span>
                  <span className="rounded-full border border-black/30 bg-white px-2 py-1 font-jeju text-xs text-black/70">
                    📍 {position.location}
                  </span>
                  <span className="rounded-full border border-black/30 bg-white px-2 py-1 font-jeju text-xs text-black/70">
                    ⏰ {position.type}
                  </span>
                </div>
                <p className="mt-4 font-jeju text-sm leading-relaxed text-black/80">
                  {position.description}
                </p>
              </div>
              
              <div className="flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={handleJoinUs}
                  className="rounded-[5px] border-2 border-black bg-mint px-8 py-3 font-jeju text-lg font-bold text-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
                >
                  Apply Now! 🚀
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex w-full max-w-[900px] flex-col gap-6 items-center">
          <div className="flex w-full flex-col sm:flex-row gap-4 items-center justify-center">
            <motion.button
              type="button"
              onClick={handleJoinUs}
              className="w-full sm:w-auto sm:flex-1 max-w-[450px] rounded-[5px] border-2 border-black bg-mint py-4 px-6 font-jeju text-xl sm:text-2xl font-bold text-black shadow-[5px_5px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_rgba(0,0,0,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              💸 GIVE US MONEY PLEASE 💸
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto sm:flex-1 max-w-[450px] rounded-[5px] border-2 border-black bg-[#EAE8E8]/50 py-4 px-6 font-jeju text-lg sm:text-xl text-black transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              ← Run Away (We Don't Blame You)
            </motion.button>
          </div>
          <motion.p
            className="font-jeju text-sm italic text-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            (We're not even kidding, we actually need it)
          </motion.p>
        </div>
      </div>
      
      <SendMoneyDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onVerified={recordDonation}
      />
    </main>
  );
}
