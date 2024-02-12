export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => {
      resolve(img);
    });
    img.addEventListener('error', reject);
    img.src = src;
  });
}

export function analyzeImage(img: HTMLImageElement) {
  const { width, height } = img;
  const canvas = document.createElement('canvas');
  canvas.height = height;
  canvas.width = width;
  const context = canvas.getContext?.('2d');
  if (context === null) {
    return;
  }
  context.drawImage(img, 0, 0);
  const imageData = context.getImageData(0, 0, width, height);

  let pixels: boolean[][] = Array.from(Array(height), (_) =>
    Array(width).fill(false),
  );

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const r = imageData.data[y * width * 4 + x * 4];
      const g = imageData.data[y * width * 4 + x * 4 + 1];
      const b = imageData.data[y * width * 4 + x * 4 + 2];
      const a = imageData.data[y * width * 4 + x * 4 + 3];

      let rgb_avg = (r + g + b) / 3;

      pixels[y][x] = rgb_avg < 90;
    }
  }
  return pixels;
}
