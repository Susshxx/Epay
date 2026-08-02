// export function playCoinSound() {
//   const audio = new Audio('/coin-sound.mp3');
//   audio.volume = 0.5;
//   audio.play().catch((error) => {
//     console.error('Failed to play sound:', error);
//   });
// }

// export function playLaughSound() {
//   const audio = new Audio('/laugh-sound.mp3');
//   audio.volume = 0.5;
//   audio.play().catch((error) => {
//     console.error('Failed to play sound:', error);
//   });
// }

// export function playCoinSoundLowVolume() {
//   const audio = new Audio('/coin-sound.mp3');
//   audio.volume = 0.25; // 50% of 0.5 = 0.25
//   audio.play().catch((error) => {
//     console.error('Failed to play sound:', error);
//   });
// }

// export function playCoinShakeSound() {
//   const audio = new Audio('/coinshake.mp3');
//   audio.volume = 0.5;
//   audio.play().catch((error) => {
//     console.error('Failed to play sound:', error);
//   });
// }



// Preload each sound once at module load, instead of constructing a new
// Audio element (and re-fetching/decoding the file) on every play call.
// Re-fetch/decode time is variable depending on cache state and main-thread
// load, which is what caused playCoinShakeSound to fire with inconsistent
// latency relative to the shake animation.
function createPreloadedAudio(src: string, volume: number): HTMLAudioElement {
  const audio = new Audio(src);
  audio.volume = volume;
  audio.preload = 'auto';
  audio.load(); // start fetching/decoding immediately, not on first play
  return audio;
}

const coinAudio = createPreloadedAudio('/coin-sound.mp3', 0.5);
const laughAudio = createPreloadedAudio('/laugh-sound.mp3', 0.5);
const coinAudioLow = createPreloadedAudio('/coin-sound.mp3', 0.25);
const coinShakeAudio = createPreloadedAudio('/coinshake.mp3', 0.5);

function playPreloaded(audio: HTMLAudioElement) {
  audio.currentTime = 0; // rewind in case it's still finishing a prior play
  audio.play().catch((error) => {
    console.error('Failed to play sound:', error);
  });
}

export function playCoinSound() {
  playPreloaded(coinAudio);
}

export function playLaughSound() {
  playPreloaded(laughAudio);
}

export function playCoinSoundLowVolume() {
  playPreloaded(coinAudioLow);
}

export function playCoinShakeSound() {
  playPreloaded(coinShakeAudio);
}