import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PostComment {
  id: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  userName: string;
  userAvatar?: string;
  postTime: string;
  timeAgo: string;
  type: 'Review' | 'Kutipan' | 'Diskusi' | 'Rekomendasi';
  taggedBook?: {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
  };
  content: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  comments: PostComment[];
}

const POSTS_KEY = '@bukoo_community_posts';
const JOINED_EVENTS_KEY = '@bukoo_joined_events';

const DEFAULT_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    userName: 'Rizqi Baihaqi Ahmadi',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
    postTime: 'Hari ini 19:29',
    timeAgo: '2 jam lalu',
    type: 'Review',
    taggedBook: {
      id: 'book_laut_bercerita',
      title: 'Laut Bercerita',
      author: 'Leila S. Chudori',
      coverUrl: 'https://covers.openlibrary.org/b/id/12781440-L.jpg',
    },
    content: 'Baru selesai baca Laut Bercerita, TERBAIK ✨ 😭, Leila beneran jenius menggambarkan duka dan perjuangan mahasiswa tahun 1998!',
    likesCount: 502,
    commentsCount: 48,
    isLiked: false,
    isBookmarked: false,
    comments: [
      {
        id: 'c-1',
        userName: 'Siti Rahma',
        text: 'Sangat setuju! Bagian surat dari dasar laut selalu bikin nyesak di dada.',
        timestamp: '1 jam lalu',
      },
      {
        id: 'c-2',
        userName: 'Ahmad Fauzi',
        text: 'Karya mahakarya sastra Indonesia modern. Harus dibaca semua pemuda!',
        timestamp: '30 mnt lalu',
      },
    ],
  },
  {
    id: 'post-2',
    userName: 'Dewi Kartika Sari',
    userAvatar: undefined,
    postTime: 'Kemarin 15:45',
    timeAgo: '1 hari lalu',
    type: 'Diskusi',
    taggedBook: {
      id: 'book_bumi_manusia',
      title: 'Bumi Manusia',
      author: 'Pramoedya Ananta Toer',
      coverUrl: 'https://covers.openlibrary.org/b/id/12528734-L.jpg',
    },
    content: 'Karakter Nyai Ontosoroh menurut kalian adalah simbol ketangguhan terbaik dalam sastra Indonesia kan? Bagaimana pendapat teman-teman?',
    likesCount: 384,
    commentsCount: 29,
    isLiked: false,
    isBookmarked: false,
    comments: [
      {
        id: 'c-3',
        userName: 'Budi Santoso',
        text: 'Pasti! Keberanian beliau melawan hukum kolonial sangat menginspirasi.',
        timestamp: 'Kemarin',
      },
    ],
  },
];

export const communityService = {
  getPosts: async (): Promise<CommunityPost[]> => {
    try {
      const data = await AsyncStorage.getItem(POSTS_KEY);
      if (!data) return DEFAULT_POSTS;
      return JSON.parse(data);
    } catch {
      return DEFAULT_POSTS;
    }
  },

  createPost: async (newPostData: Omit<CommunityPost, 'id' | 'likesCount' | 'commentsCount' | 'comments'>): Promise<CommunityPost[]> => {
    const existing = await communityService.getPosts();
    const newPost: CommunityPost = {
      ...newPostData,
      id: `post-${Date.now()}`,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      isBookmarked: false,
      comments: [],
    };
    const updated = [newPost, ...existing];
    try {
      await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('[communityService] Error saving posts:', e);
    }
    return updated;
  },

  toggleLike: async (postId: string): Promise<CommunityPost[]> => {
    const posts = await communityService.getPosts();
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
        };
      }
      return p;
    });
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(updated));
    return updated;
  },

  toggleBookmark: async (postId: string): Promise<CommunityPost[]> => {
    const posts = await communityService.getPosts();
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          isBookmarked: !p.isBookmarked,
        };
      }
      return p;
    });
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(updated));
    return updated;
  },

  addComment: async (postId: string, commentText: string, userName: string): Promise<CommunityPost[]> => {
    const posts = await communityService.getPosts();
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const newComment: PostComment = {
          id: `comment-${Date.now()}`,
          userName,
          text: commentText,
          timestamp: 'Baru saja',
        };
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...p.comments, newComment],
        };
      }
      return p;
    });
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(updated));
    return updated;
  },

  getJoinedEvents: async (): Promise<string[]> => {
    try {
      const data = await AsyncStorage.getItem(JOINED_EVENTS_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  toggleJoinEvent: async (eventId: string): Promise<boolean> => {
    const joined = await communityService.getJoinedEvents();
    let updated: string[];
    let isJoined = false;

    if (joined.includes(eventId)) {
      updated = joined.filter((id) => id !== eventId);
      isJoined = false;
    } else {
      updated = [...joined, eventId];
      isJoined = true;
    }

    await AsyncStorage.setItem(JOINED_EVENTS_KEY, JSON.stringify(updated));
    return isJoined;
  },
};
