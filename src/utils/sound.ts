export function playCoinSound() {
  const audio = new Audio('/coin-sound.mp3');
  audio.volume = 0.5;
  audio.play().catch((error) => {
    console.error('Failed to play sound:', error);
  });
}

export function playLaughSound() {
  const audio = new Audio('/laugh-sound.mp3');
  audio.volume = 0.5;
  audio.play().catch((error) => {
    console.error('Failed to play sound:', error);
  });
}
