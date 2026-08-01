import React, { useState } from 'react';
import { ActivityLogsCard } from '../components/ActivityLogsCard';
import { ActivityLogModal } from '../components/ActivityLogModal';
import { DonationToast } from '../components/DonationToast';
import { DonorCard } from '../components/DonorCard';
import { DonorsModal } from '../components/DonorsModal';
import { FallingMoneyAnimation } from '../components/FallingMoneyAnimation';
import { HeroVessel } from '../components/HeroVessel';
import { LeaderboardCard } from '../components/LeaderboardCard';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { MoneyTotals } from '../components/MoneyTotals';
import { SendMoneyDialog } from '../components/SendMoneyDialog';
import { ThankYouOverlay } from '../components/ThankYouOverlay';
import { TierDisplay } from '../components/TierDisplay';
import { featuredDonor, images, topDonor, tiers } from '../data/epay';
import { useFitToScreen } from '../hooks/useFitToScreen';
import { useFundingProgress } from '../hooks/useFundingProgress';
import { playCoinSound } from '../utils/sound';

const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 1024;

export function Home() {
  const scale = useFitToScreen(DESIGN_WIDTH, DESIGN_HEIGHT);
  const { earned, spent, tier, progressPercent, isMaxTier, nextGoal, lastDonation, recordDonation, showMoneyAnimation, handleAnimationComplete } =
  useFundingProgress();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isActivityLogModalOpen, setIsActivityLogModalOpen] = useState(false);
  const [isDonorsModalOpen, setIsDonorsModalOpen] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [showFallingAnimation, setShowFallingAnimation] = useState(false);
  const [lastDonationAmount, setLastDonationAmount] = useState(0);

  const handleDonationVerified = async (amount: number, donorName: string, message: string) => {
    await recordDonation(amount, donorName, message);
    // Close dialog immediately (already handled in SendMoneyDialog)
    // Play sound
    playCoinSound();
    // Store donation amount for animation
    setLastDonationAmount(amount);
    // Start falling animation
    setShowFallingAnimation(true);
  };

  const handleFallingAnimationComplete = () => {
    setShowFallingAnimation(false);
    // Show thank you overlay after animation
    setIsThankYouOpen(true);
  };

  return (
    <main className="w-full min-h-screen overflow-x-hidden bg-canvas">
      {/* Phone / tablet layout: normal document flow, no scaling */}
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-12 px-6 py-10 sm:gap-16 sm:px-10 sm:py-14 lg:hidden">
        <div className="flex w-full max-w-[420px] flex-col gap-3">
          <header className="flex items-center gap-2 relative overflow-visible">
            <img
              src={images.logo}
              alt=""
              aria-hidden="true"
              className="h-14 w-14 shrink-0 relative z-10" />
            <img
              src="/image.png"
              alt=""
              aria-hidden="true"
              className="absolute -left-4 -top-4 h-50 w-60 shrink-0 z-20" />

            <h1 className="font-didot text-3xl leading-tight text-black sm:text-4xl">E-Pay</h1>
          </header>

          <p className="font-jeju text-lg leading-6 text-black sm:text-xl">
            The process of becoming who we are now
          </p>
        </div>

        <section className="flex w-full max-w-[420px] flex-col items-center gap-5">
          <HeroVessel
            src={tier.image}
            alt={`Current funding vessel: ${tier.name}`}
            className="relative aspect-square w-full max-w-[300px]"
            showMoneyAnimation={showMoneyAnimation}
            onAnimationComplete={handleAnimationComplete} />
          

          <div className="flex w-full items-center justify-center rounded-[8px] border border-black bg-[#EAE8E8]/50 px-4 py-3 text-center">
            <p className="font-jeju text-base text-black sm:text-xl">
              Current Tier: {tier.name} (Level {tier.level})
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="w-full max-w-[260px] rounded-[5px] border border-black bg-mint py-3 font-jeju text-2xl text-black transition-transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
            
            Replace Us
          </button>

          <DonationToast amount={lastDonation} />

          <div className="w-full">
            <TierDisplay tiers={tiers} currentTier={tier} />
          </div>
        </section>

        <section className="flex w-full max-w-[420px] flex-col items-center gap-2 text-center">
          <p className="font-jeju text-2xl text-black">
            {isMaxTier ? 'Goal Reached! 🎉' : `Goal: Rs ${nextGoal}`}
          </p>
          <div className="h-[3px] w-[172px] overflow-hidden rounded-full bg-black/15">
            <div
              className="h-full bg-mint transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }} />

          </div>
          <p className="sr-only">Rs {earned} raised so far</p>
        </section>

        <MoneyTotals earned={earned} spent={spent} />

        <ActivityLogsCard onViewAll={() => setIsActivityLogModalOpen(true)} />

        <section
          aria-label="Donor testimonials"
          className="grid w-full max-w-[420px] grid-cols-1 gap-8 sm:max-w-none sm:grid-cols-2">
          
          {featuredDonor && <DonorCard donor={featuredDonor} />}
          {topDonor && <DonorCard donor={topDonor} />}
        </section>

        <img
          src={images.dreamJar}
          alt="A glass jar labelled Dreams, filled with banknotes"
          className="h-auto w-full max-w-[180px]" />
        

        <blockquote className="w-full max-w-[420px] text-center font-jeju text-2xl leading-8 text-black sm:text-3xl">
          <p>“{tier.quote}”</p>
        </blockquote>

        <section
          aria-labelledby="join-us-heading-mobile"
          className="flex w-full max-w-[420px] flex-col items-center gap-6">
          
          <h2
            id="join-us-heading-mobile"
            className="text-center font-jeju text-3xl leading-9 text-black sm:text-4xl">
            
            Join Us:
            <br />
            Become one of us
          </h2>

          <LeaderboardTable />

          <button
            type="button"
            onClick={() => setIsDonorsModalOpen(true)}
            className="font-jeju text-xl leading-6 text-black underline-offset-4 transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
            
            View All Donors
          </button>
        </section>
      </div>

      {/* Desktop layout: pixel-perfect canvas, scaled to fit the viewport */}
      <div className="hidden h-screen w-full items-center justify-center overflow-hidden lg:flex">
        <div
          className="relative h-[1024px] w-[1440px] shrink-0 overflow-hidden"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
          
          {/* Brand */}
          <header className="absolute left-[79px] top-[73px] flex items-center gap-[3px] relative overflow-visible">
            <img
              src={images.logo}
              alt=""
              aria-hidden="true"
              width={72}
              height={72}
              className="h-[72px] w-[72px] relative z-10" />
            <img
              src="/image.png"
              alt=""
              aria-hidden="true"
              width={120}
              height={220}
              className="absolute -left-6 -top-6 h-[120px] w-[220px] z-20" />

            <h1 className="font-didot text-[32px] leading-10 text-black">E-Pay</h1>
          </header>

          <p className="absolute left-[98px] top-[145px] font-jeju text-2xl leading-6 text-black">
            The process of becoming who we are now
          </p>

          {/* Activity logs */}
          <div className="absolute left-[79px] top-[201px] w-[362px]">
            <ActivityLogsCard onViewAll={() => setIsActivityLogModalOpen(true)} />
          </div>

          {/* Dream jar + quote */}
          <img
            src={images.dreamJar}
            alt="A glass jar labelled Dreams, filled with banknotes"
            width={205}
            height={307}
            className="absolute left-[68px] top-[420px] h-[307px] w-[205px]" />
          

          <blockquote className="absolute left-[31px] top-[747px] w-[420px] font-jeju text-[32px] leading-8 text-black">
            <p>“{tier.quote}”</p>
          </blockquote>

          {featuredDonor && (
            <div className="absolute left-[79px] top-[892px]">
              <DonorCard donor={featuredDonor} />
            </div>
          )}

          {/* Centre column */}
          {topDonor && (
            <div className="absolute left-[741px] top-[169px]">
              <DonorCard donor={topDonor} />
            </div>
          )}

          <div className="absolute left-[516px] top-[299px] flex h-[60px] w-[415px] items-center rounded-[8px] border border-black bg-[#EAE8E8]/50 px-4">
            <p className="font-jeju text-2xl leading-6 text-black">
              Current Tier: {tier.name} (Level {tier.level})
            </p>
          </div>

          <HeroVessel
            src={tier.image}
            alt={`Current funding vessel: ${tier.name}`}
            className="absolute left-[475px] top-[380px] h-[531px] w-[531px]"
            showMoneyAnimation={showMoneyAnimation}
            onAnimationComplete={handleAnimationComplete} />
          

          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="absolute left-[619px] top-[899px] h-[56px] w-[220px] rounded-[5px] border border-black bg-mint font-jeju text-[32px] leading-8 text-black transition-transform hover:-translate-y-[2px] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
            
            Replace Us
          </button>

          <div className="absolute left-[619px] top-[963px] w-[220px]">
            <DonationToast amount={lastDonation} />
          </div>

          <div className="absolute left-[80px] top-[850px]">
            <TierDisplay tiers={tiers} currentTier={tier} />
          </div>

          {/* Right column */}
          <section aria-labelledby="join-us-heading" className="absolute left-[1118px] top-[90px]">
            <h2
              id="join-us-heading"
              className="w-[242px] font-jeju text-[32px] leading-8 text-black">
              
              Join Us:
              <br />
              Become one of us
            </h2>
          </section>

          <div className="absolute left-[1058px] top-[171px]">
            <LeaderboardCard onViewAll={() => setIsDonorsModalOpen(true)} />
          </div>

          <button
            type="button"
            onClick={() => setIsDonorsModalOpen(true)}
            className="absolute left-[1147px] top-[440px] font-jeju text-2xl leading-6 text-black underline-offset-4 transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
            
            View All Donors
          </button>

          <div className="absolute left-[1143px] top-[537px]">
            <p className="font-jeju text-[32px] leading-8 text-black">
              {isMaxTier ? 'Goal Reached! 🎉' : `Goal: Rs ${nextGoal}`}
            </p>
            <div className="mt-[10px] h-[3px] w-[172px] overflow-hidden rounded-full bg-black/15">
              <div
                className="h-full bg-mint transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }} />
              
            </div>
            <p className="sr-only">Rs {earned} raised so far</p>
          </div>

          <div className="absolute left-[1162px] top-[600px]">
            <MoneyTotals earned={earned} spent={spent} />
          </div>
        </div>
      </div>

      <SendMoneyDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onVerified={handleDonationVerified} />

      <ActivityLogModal
        isOpen={isActivityLogModalOpen}
        onClose={() => setIsActivityLogModalOpen(false)} />

      <DonorsModal isOpen={isDonorsModalOpen} onClose={() => setIsDonorsModalOpen(false)} />

      <FallingMoneyAnimation
        isActive={showFallingAnimation}
        donationAmount={lastDonationAmount}
        goalPercent={progressPercent}
        onComplete={handleFallingAnimationComplete} />

      <ThankYouOverlay
        isOpen={isThankYouOpen}
        onClose={() => setIsThankYouOpen(false)} />
    </main>);

}