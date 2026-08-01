import React, { useMemo } from 'react';
import { images, moneyStack } from '../data/epay';

type MoneyTotalsProps = {
  earned: number;
  spent?: number;
};

// Calculate how many bills to show based on amount
// More proportional scaling to accurately reflect relative amounts
function calculateStackSize(amount: number): number {
  if (amount <= 0) return 0;
  // Use proportional scaling: each ~1500 = 1 bill, capped at 15 bills
  const stackSize = Math.ceil(amount / 1500);
  return Math.min(stackSize, 15); // Maximum 15 bills to fit UI
}

// Calculate stacks based on amount (new stack every 25000)
function calculateStacks(amount: number): { fullStacks: number; remainingAmount: number } {
  if (amount <= 0) return { fullStacks: 0, remainingAmount: 0 };
  const fullStacks = Math.floor(amount / 25000);
  const remainingAmount = amount % 25000;
  return { fullStacks, remainingAmount };
}

export function MoneyTotals({ earned, spent = 0 }: MoneyTotalsProps) {
  const earnedStacks = useMemo(() => calculateStacks(earned), [earned]);
  const spentStacks = useMemo(() => calculateStacks(spent), [spent]);

  const earnedStackSize = useMemo(() => calculateStackSize(earnedStacks.remainingAmount), [earnedStacks.remainingAmount]);
  const spentStackSize = useMemo(() => calculateStackSize(spentStacks.remainingAmount), [spentStacks.remainingAmount]);

  // Get the bills to display for earned money
  const earnedBills = useMemo(() => {
    const bills = [];
    const cycleLength = moneyStack.length;
    for (let i = 0; i < earnedStackSize; i++) {
      bills.push(moneyStack[i % cycleLength]);
    }
    return bills;
  }, [earnedStackSize]);

  // Get the bills to display for spent money
  const spentBills = useMemo(() => {
    const bills = [];
    const cycleLength = moneyStack.length;
    for (let i = 0; i < spentStackSize; i++) {
      bills.push(moneyStack[i % cycleLength]);
    }
    return bills;
  }, [spentStackSize]);

  // Fixed height for containers - money grows upwards within this space
  const fixedHeight = 300;

  return (
    <div className="flex items-end gap-[43px]">
      <div className="flex flex-col items-center">
        <div className="flex gap-2">
          {/* Full stacks */}
          {Array.from({ length: Math.min(earnedStacks.fullStacks, 3) }).map((_, stackIndex) => (
            <div key={`earned-full-${stackIndex}`} className="relative w-[72px]" style={{ height: `${fixedHeight}px` }}>
              {Array.from({ length: 15 }).map((_, billIndex) => (
                <React.Fragment key={`earned-full-${stackIndex}-${billIndex}`}>
                  <img
                    src={moneyStack[billIndex % moneyStack.length].back}
                    alt=""
                    aria-hidden="true"
                    width={72}
                    height={72}
                    className="absolute left-0 w-[72px] transition-all duration-300"
                    style={{ bottom: billIndex * 16 + 16 }} />
                  <img
                    src={moneyStack[billIndex % moneyStack.length].front}
                    alt=""
                    aria-hidden="true"
                    width={72}
                    height={72}
                    className="absolute left-0 w-[72px] transition-all duration-300"
                    style={{ bottom: billIndex * 16 + 24 }} />
                </React.Fragment>
              ))}
            </div>
          ))}
          {/* Remaining stack */}
          <div className="relative w-[72px]" style={{ height: `${fixedHeight}px` }}>
            {earnedStackSize === 0 ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-black/10" />
              </div>
            ) : (
              earnedBills.map((bill, index) =>
              <React.Fragment key={`${bill.front}-${index}`}>
                  <img
                  src={bill.back}
                  alt=""
                  aria-hidden="true"
                  width={72}
                  height={72}
                  className="absolute left-0 w-[72px] transition-all duration-300"
                  style={{ bottom: index * 16 + 16 }} />

                  <img
                  src={bill.front}
                  alt=""
                  aria-hidden="true"
                  width={72}
                  height={72}
                  className="absolute left-0 w-[72px] transition-all duration-300"
                  style={{ bottom: index * 16 + 24 }} />

                </React.Fragment>
              )
            )}
          </div>
        </div>
        <p className="font-jeju text-2xl leading-6 text-black">Rs {earned}</p>
        <p className="font-jeju text-2xl leading-6 text-black">Earned</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex gap-2">
          {/* Full stacks */}
          {Array.from({ length: Math.min(spentStacks.fullStacks, 3) }).map((_, stackIndex) => (
            <div key={`spent-full-${stackIndex}`} className="relative w-[72px]" style={{ height: `${fixedHeight}px` }}>
              {Array.from({ length: 15 }).map((_, billIndex) => (
                <React.Fragment key={`spent-full-${stackIndex}-${billIndex}`}>
                  <img
                    src={moneyStack[billIndex % moneyStack.length].back}
                    alt=""
                    aria-hidden="true"
                    width={72}
                    height={72}
                    className="absolute left-0 w-[72px] transition-all duration-300"
                    style={{ bottom: billIndex * 16 + 16 }} />
                  <img
                    src={moneyStack[billIndex % moneyStack.length].front}
                    alt=""
                    aria-hidden="true"
                    width={72}
                    height={72}
                    className="absolute left-0 w-[72px] transition-all duration-300"
                    style={{ bottom: billIndex * 16 + 24 }} />
                </React.Fragment>
              ))}
            </div>
          ))}
          {/* Remaining stack */}
          <div className="relative w-[72px]" style={{ height: `${fixedHeight}px` }}>
            {spentStackSize === 0 ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-black/10" />
              </div>
            ) : (
              spentBills.map((bill, index) =>
              <React.Fragment key={`${bill.front}-${index}`}>
                  <img
                  src={bill.back}
                  alt=""
                  aria-hidden="true"
                  width={72}
                  height={72}
                  className="absolute left-0 w-[72px] transition-all duration-300"
                  style={{ bottom: index * 16 + 16 }} />

                  <img
                  src={bill.front}
                  alt=""
                  aria-hidden="true"
                  width={72}
                  height={72}
                  className="absolute left-0 w-[72px] transition-all duration-300"
                  style={{ bottom: index * 16 + 24 }} />

                </React.Fragment>
              )
            )}
          </div>
        </div>
        <p className="font-jeju text-2xl leading-6 text-black">Rs {spent}</p>
        <p className="font-jeju text-2xl leading-6 text-black">Spent</p>
      </div>
    </div>);

}