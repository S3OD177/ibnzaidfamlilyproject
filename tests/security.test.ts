import { beforeEach, expect, test, vi } from 'vitest';
type TestUser = { id: string; role: 'admin' | 'member'; status: string; passwordHash: string; memberId: string | null; username: string };
type TestOwner = { id: string; privacy: { photo: string }; isPublic: number };
const state = vi.hoisted(() => ({ owners: [] as TestOwner[], file: { visibility: 'public', name: 'photo.png', mimeType: 'image/png', data: Buffer.from('') }, user: null as TestUser | null, cookie: '', tables: [] as { table_name: string }[], rows: {} as Record<string, Record<string, unknown>[]> }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => ({ value: state.cookie }) }) }));
vi.mock('@/db', () => ({ schema: { users: { id: 'id' }, passwordResets: {} }, getDb: () => ({ transaction: async (run: (tx: unknown) => Promise<unknown>) => run({
    update: () => ({ set: (values: { passwordHash?: string }) => ({ where: () => ({ returning: async () => {
        if (values.passwordHash && state.user) state.user.passwordHash = values.passwordHash;
        return [{ id: state.user?.id, userId: state.user?.id }];
    } }) }) }),
}), select: () => ({ from: () => ({ where: async () => state.user ? [state.user] : [] }) }), execute: async (query: unknown) => {
    const chunks = JSON.stringify(query);
    if (chunks.includes('information_schema')) return state.tables;
    for (const name of Object.keys(state.rows)) if (chunks.includes(name)) return state.rows[name];
    return [];
} }) }));
vi.mock('@/lib/files', () => ({ ALLOWED_TYPES: { 'image/png': { inline: true } }, getFile: async () => state.file, getPhotoOwners: async () => state.owners }));
import { resetPassword } from '@/app/portal/reset/actions';
import nextConfig from '../next.config';
import { credentialVersion, createSessionToken, verifySessionToken } from '@/lib/auth/session';
import { getSession } from '@/lib/auth/current';
import { GET as download } from '@/app/files/[id]/route';
import { GET as backup } from '@/app/api/admin/backup/route';
const id = '11111111-1111-4111-8111-111111111111';
async function login(role: 'admin' | 'member' = 'member') {
    state.user = { id, role, status: 'active', passwordHash: 'old-salted-password-hash', memberId: id, username: 'test' };
    state.cookie = await createSessionToken({ userId: id, role, credentialVersion: await credentialVersion(state.user!.passwordHash) });
}
const requestFile = (headers = {}) => download(new Request(`https://family.test/files/${id}`, { headers }), { params: Promise.resolve({ id }) });
beforeEach(() => {
    process.env.AUTH_SECRET = 'test-only-secret-with-at-least-32-characters';
    state.cookie = ''; state.user = null; state.owners = [];
    state.file = { visibility: 'public', name: 'photo.png', mimeType: 'image/png', data: Buffer.from('image-content') };
});
test('public file is readable but never cacheable', async () => {
    const res = await requestFile(); expect(res.status).toBe(200); expect(await res.text()).toBe('image-content'); expect(res.headers.get('cache-control')).toBe('private, no-store');
});
test('changing a public photo to private blocks the same URL for anonymous and unrelated members', async () => {
    state.owners = [{ id, privacy: { photo: 'public' }, isPublic: 1 }];
    expect((await requestFile()).status).toBe(200);
    state.owners[0].privacy.photo = 'private';
    expect((await requestFile()).status).toBe(303);
    await login(); state.user!.memberId = 'other'; expect((await requestFile()).status).toBe(403);
});
test('owner and staff can download private photos', async () => {
    state.owners = [{ id, privacy: { photo: 'private' }, isPublic: 0 }];
    await login(); expect((await requestFile()).status).toBe(200);
    await login('admin'); state.user!.memberId = null; expect((await requestFile()).status).toBe(200);
});
test('members-only photos and hidden public profiles reject anonymous access', async () => {
    state.owners = [{ id, privacy: { photo: 'members' }, isPublic: 1 }];
    expect((await requestFile()).status).toBe(303);
    await login(); state.user!.memberId = 'other'; expect((await requestFile()).status).toBe(200);
    state.cookie = ''; state.owners[0] = { id, privacy: { photo: 'public' }, isPublic: 0 };
    expect((await requestFile()).status).toBe(303);
});
test('changing an album file to members-only enforces the new permission', async () => {
    expect((await requestFile()).status).toBe(200); state.file.visibility = 'members';
    expect((await requestFile()).status).toBe(303); await login(); expect((await requestFile()).status).toBe(200);
});
test('partial media responses also cannot be cached', async () => {
    const res = await requestFile({ range: 'bytes=0-4' }); expect(res.status).toBe(206); expect(await res.text()).toBe('image'); expect(res.headers.get('cache-control')).toBe('private, no-store');
});
test('password changes invalidate old sessions, while fresh login succeeds', async () => {
    await login(); expect(await getSession()).not.toBeNull();
    state.user!.passwordHash = 'new-salted-password-hash'; expect(await getSession()).toBeNull();
    state.cookie = await createSessionToken({ userId: id, role: 'member', credentialVersion: await credentialVersion(state.user!.passwordHash) });
    expect(await getSession()).not.toBeNull();
});
test('tampered and legacy sessions are rejected', async () => {
    await login(); expect(await verifySessionToken(state.cookie + 'x')).toBeNull();
    expect(await verifySessionToken('id.member.9999999999.signature')).toBeNull();
});
test('backup excludes auth secrets, password hashes and reset tokens, retaining site settings', async () => {
    await login('admin');
    state.tables = ['settings', 'users', 'password_resets'].map(table_name => ({ table_name }));
    state.rows = { settings: [{ key: 'auth_secret', value: 'sensitive-secret' }, { key: 'future_secret', value: 'sensitive-future' }, { key: 'site', value: { siteName: 'Family' } }, { key: 'about', value: {} }], users: [{ id, password_hash: 'sensitive-hash' }], password_resets: [{ token_hash: 'sensitive-token' }] };
    const res = await backup(new Request('https://family.test/api/admin/backup')); expect(res.status).toBe(200);
    const data = await res.json(); expect(data.tables.settings.map((row: { key: string }) => row.key)).toEqual(['site', 'about']);
    expect(JSON.stringify(data)).not.toContain('sensitive'); expect(data.tables.password_resets).toBeUndefined();
});
test('non-admin cannot export a backup', async () => { await login(); expect((await backup(new Request('https://family.test/api/admin/backup'))).status).toBe(403); });

test('password recovery action revokes an existing session', async () => {
    await login();
    const result = await resetPassword({ token: 'claimed-token-in-test-db', password: 'new-password-123', confirm: 'new-password-123' });
    expect(result.ok).toBe(true);
    expect(state.user!.passwordHash).toMatch(/^scrypt\$/);
    expect(await getSession()).toBeNull();
});
test('image optimizer is disabled so it cannot bypass file permissions or cache private images', () => {
    expect(nextConfig.images?.unoptimized).toBe(true);
});
