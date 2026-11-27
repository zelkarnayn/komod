import { describe, expect, it } from 'vitest';
import { photoSources } from './photo-sources';

describe('photoSources', () => {
  it('для фото с Диска добавляет все ширины', () => {
    expect(photoSources('/photos/KM-001/abc-1600.webp', '300px')).toEqual({
      src: '/photos/KM-001/abc-1600.webp',
      srcSet: '/photos/KM-001/abc-600.webp 600w, /photos/KM-001/abc-1600.webp 1600w',
      sizes: '300px',
    });
  });

  it('прочие фото отдаёт как есть', () => {
    expect(photoSources('/products/KM-001_main.jpg', '300px')).toEqual({ src: '/products/KM-001_main.jpg' });
  });
});
