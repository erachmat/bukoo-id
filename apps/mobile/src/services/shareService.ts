import Share, { Social } from 'react-native-share';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';

/** Public web home link used as the Instagram Story attribution target. */
export const appShareLink = 'https://bukoo.id';

/** Public book page link — https://bukoo.id/book/<id> (public, no auth). */
export function bookShareLink(bookId: string): string {
  return `https://bukoo.id/book/${bookId}`;
}

/**
 * BUKOO's Android application id — sent as `source_application` on the
 * Instagram Story intent (see react-native-share InstagramStoriesShare.java).
 */
const IG_STORY_APP_ID = 'com.erachmat.bukoo';

/**
 * Captures a rendered React Native View (the share card) to a PNG temp file.
 * The target view must be mounted + laid out (use `collapsable={false}`).
 */
export async function captureCard(ref: RefObject<View | null>): Promise<string> {
  return captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
}

/**
 * Shares the card image to an Instagram Story as a sticker with a tappable
 * web link (`attributionURL`). Rejects when Instagram is not installed.
 */
export async function shareCardToIGStory(imageUri: string, link: string): Promise<void> {
  await Share.shareSingle({
    social: Social.InstagramStories,
    appId: IG_STORY_APP_ID,
    stickerImage: imageUri,
    backgroundTopColor: '#0B1914',
    backgroundBottomColor: '#0B1914',
    attributionURL: link,
  });
}

/** Opens the system share sheet with the card image (WhatsApp, X, Telegram, ...). */
export async function shareCardGeneric(imageUri: string, message: string): Promise<void> {
  await Share.open({
    url: imageUri,
    type: 'image/png',
    message,
    title: 'BUKOO',
  });
}
