import { getDownloadUrl } from '../index';

describe('getDownloadUrl', () => {
    it('keeps external URLs unchanged', () => {
        expect(getDownloadUrl('https://cdn.example.com/avatar.png')).toBe('https://cdn.example.com/avatar.png');
    });

    it('keeps app root-relative paths unchanged', () => {
        expect(getDownloadUrl('/images/common/no-data.png')).toBe('/images/common/no-data.png');
    });

    it('prefixes backend file paths with the download endpoint', () => {
        expect(getDownloadUrl('uploads/profile.png')).toContain('v1/file/download/uploads/profile.png');
    });
});
