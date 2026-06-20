import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadBlobAsFile } from './downloadFile';

const MOCK_BLOB_URL = 'blob:mock-csv-url';

describe('downloadBlobAsFile', () => {
  let createObjectURLSpy = vi.fn<typeof URL.createObjectURL>();
  let revokeObjectURLSpy = vi.fn<typeof URL.revokeObjectURL>();
  let clickSpy = vi.fn<HTMLAnchorElement['click']>();
  let createElementSpy = vi.fn<typeof document.createElement>();
  let createdAnchors: HTMLAnchorElement[] = [];

  beforeEach(() => {
    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = () => '';
    }
    if (typeof URL.revokeObjectURL !== 'function') {
      URL.revokeObjectURL = () => undefined;
    }
    createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue(MOCK_BLOB_URL);
    revokeObjectURLSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined);

    createdAnchors = [];
    const originalCreateElement = document.createElement.bind(document);
    createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation(((tag: string) => {
        const element = originalCreateElement(tag);
        if (tag.toLowerCase() === 'a') {
          createdAnchors.push(element as HTMLAnchorElement);
        }
        return element;
      }) as typeof document.createElement);

    clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a Blob with the provided content and mime type', async () => {
    const content = new Blob(['id,name\r\n1,pikachu'], {
      type: 'text/csv;charset=utf-8',
    });
    downloadBlobAsFile(content, '1_items.csv');

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/csv;charset=utf-8');
    await expect(blob.text()).resolves.toBe('id,name\r\n1,pikachu');
  });

  it('configures temporary anchor with download filename and triggers a click', () => {
    downloadBlobAsFile(
      new Blob(['csv-content'], { type: 'text/csv;charset=utf-8' }),
      '5_items.csv'
    );

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(createdAnchors).toHaveLength(1);
    const anchor = createdAnchors[0];
    expect(anchor.download).toBe('5_items.csv');
    expect(anchor.getAttribute('href')).toBe(MOCK_BLOB_URL);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('removes the temporary anchor and revokes the object URL after click', () => {
    downloadBlobAsFile(
      new Blob(['csv-content'], { type: 'text/csv;charset=utf-8' }),
      '5_items.csv'
    );

    expect(createdAnchors).toHaveLength(1);
    expect(document.body.contains(createdAnchors[0])).toBe(false);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith(MOCK_BLOB_URL);
  });
});
