import { addInvite, generateSignupLink, getInviteEmailFromToken, isInvited } from '@/services/inviteStore';

describe('inviteStore token invite flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('validates invite tokens without relying on existing localStorage in the signup browser', () => {
    const invite = addInvite('new.user@example.com');
    const link = generateSignupLink(invite.email, invite.token);
    const url = new URL(link);
    const token = url.searchParams.get('token');

    localStorage.clear();

    expect(token).toBeTruthy();
    expect(getInviteEmailFromToken(token)).toBe('new.user@example.com');
    expect(isInvited('new.user@example.com', token)).toBe(true);
  });
});