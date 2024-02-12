import { subdivide } from './TimelineFunctions';

describe('subdivide', () => {
  it('should return an empty array if n is less than or equal to 0', () => {
    const n = 0;
    const start = 0;
    const end = 0;

    const result = subdivide(n, start, end);

    expect(result).toEqual([]);
  });

  it('should return an array of length n', () => {
    const n = 3;
    const start = 0;
    const end = 1;

    const result = subdivide(n, start, end);

    expect(result).toHaveLength(n);
  });

  it('should return an array with evenly distributed spacings', () => {
    const n = 1;
    const start = 0;
    const end = 1;

    const result = subdivide(n, start, end);

    expect(result).toEqual([0.5]);
  });

  it('should handle negative start and end values', () => {
    const n = 3;
    const start = -1;
    const end = 1;

    const result = subdivide(n, start, end);

    expect(result).toEqual([-0.5, 0, 0.5]);
  });

  it('should handle non-integer spread values', () => {
    const n = 2;
    const start = 0;
    const end = 1.5;

    const result = subdivide(n, start, end);

    expect(result).toEqual([0.5, 1]);
  });
});
