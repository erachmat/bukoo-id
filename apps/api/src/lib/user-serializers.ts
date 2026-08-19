import type { users } from '@bukoo/db';
import type { AuthUserDto, UserDto } from '@bukoo/shared-types';

/** Favorite genres are stored as a JSON text column; parse defensively on read. */
function parseFavoriteGenres(raw: string | null): string[] {
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((g): g is string => typeof g === 'string') : [];
  } catch {
    return [];
  }
}

export interface SubscriptionLike {
  planId: string;
  currentPeriodEnd: string | null;
  status: string;
  paymentGateway: string | null;
}

/** Auth-response user (login/register/refresh) — subscription/favorites not included. */
export function toUserPublic(user: typeof users.$inferSelect): AuthUserDto {
  return {
    id: user.id,
    name: user.name ?? '',
    email: user.email,
    avatarUrl: user.avatar,
    role: user.role,
    onboardingCompleted: user.onboardingCompleted,
    createdAt: user.createdAt,
  };
}

/** Full /users/me shape — AuthUserDto + favoriteGenres + subscription. */
export function serializeUser(user: typeof users.$inferSelect, sub: SubscriptionLike | null): UserDto {
  const active = !!sub && (sub.status === 'ACTIVE' || sub.status === 'TRIALING');
  const subscription = sub
    ? {
        active,
        tier: active ? sub.planId.replace('plan_', '').toUpperCase() : 'FREE',
        planId: sub.planId,
        expiresAt: sub.currentPeriodEnd ?? null,
        status: sub.status,
        paymentGateway: sub.paymentGateway ?? null,
      }
    : null;

  return {
    ...toUserPublic(user),
    favoriteGenres: parseFavoriteGenres(user.favoriteGenres),
    subscription,
  };
}
