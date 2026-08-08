import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { useReadingSession } from '../../hooks/useReadingSession';
import { bookmarkService, Bookmark } from '../../services/bookmarkService';
import { highlightService, Highlight } from '../../services/highlightService';
import { bookDownloadService } from '../../services/bookDownload';
import { MASTER_SAMPLE_BOOKS } from '../book/BookDetailScreen';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';
import { TocModal } from './components/TocModal';
import { SearchModal, SearchResultItem } from './components/SearchModal';
import { SettingsModal, ReaderTheme } from './components/SettingsModal';
import { HighlightModal } from './components/HighlightModal';

// ─── Types ────────────────────────────────────────────────────────────────────

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type ReadingScreenProps = NativeStackScreenProps<RootStackParamList, 'ReadingScreen'>;

interface TocItem {
  id?: string;
  href: string;
  label: string;
  subitems?: TocItem[];
}

interface EpubMessage {
  type: 'PAGE_CHANGED' | 'READY' | 'ERROR' | 'TOTAL_PAGES' | 'TOC' | 'TEXT_SELECTED' | 'SHELL_READY' | 'TOGGLE_CONTROLS';
  page?: number;
  cfi?: string;
  percent?: number;
  totalPages?: number;
  error?: string;
  toc?: TocItem[];
  chapterTitle?: string;
  chapterCurrentPage?: number;
  chapterTotalPages?: number;
  text?: string;
  bookLoadDurationMs?: number;
  locationGenTimeMs?: number;
  cachedLocsUsed?: boolean;
}

// ─── JavaScript injected into the WebView ────────────────────────────────────
// This script:
//  1. Initialises epubjs with the local EPUB file.
//  2. Listens for epubjs "relocated" events to detect page changes.
//  3. Sends structured messages back to React Native.
//  4. Exposes prevPage() / nextPage() helpers that React Native can call via
//     injectJavaScript.

// Module-level caching for loaded library code (survives screen unmounts)
let cachedEpubJsContent: string | null = null;
let cachedJsZipContent: string | null = null;
let cachedPdfJsContent: string | null = null;
let cachedPdfWorkerContent: string | null = null;

// ── EPUB JS Bridge ────────────────────────────────────────────────────────────
// This script is injected into the WebView ONCE via the static HTML shell.
// It exposes window.__bukooLoadBook(bookUrl, cachedLocs) which React Native calls
// via injectJavaScript to load a book WITHOUT reloading the WebView.
const EPUB_JS_BRIDGE = `
(function () {
  'use strict';

  function sendMessage(obj) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(obj));
    }
  }

  function loadBookBuffer(bookUrl) {
    if (bookUrl.startsWith('data:')) {
      var b64 = bookUrl.split(',')[1] || '';
      var bin = window.atob(b64);
      var buf = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      return Promise.resolve(buf.buffer);
    }
    return fetch(bookUrl)
      .then(function (res) { return res.arrayBuffer(); })
      .catch(function () {
        return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', bookUrl, true);
          xhr.responseType = 'arraybuffer';
          xhr.onload = function () {
            if (xhr.status === 200 || xhr.status === 0) {
              resolve(xhr.response);
            } else {
              reject(new Error('XHR load status ' + xhr.status));
            }
          };
          xhr.onerror = function (e) { reject(e); };
          xhr.send();
        });
      });
  }

  var __bukooPdfState = {
    currentNum: 1,
    total: 0,
    canvases: []
  };

  var __bukooChunkBuffer = [];

  window.__bukooResetChunks = function () {
    __bukooChunkBuffer = [];
  };

  window.__bukooPushChunk = function (chunk) {
    __bukooChunkBuffer.push(chunk);
  };

  window.__bukooLoadPdfFromChunks = function (mimeType) {
    var fullB64 = __bukooChunkBuffer.join('');
    __bukooChunkBuffer = [];
    var payloadUrl = 'data:' + mimeType + ';base64,' + fullB64;
    console.log('[WebView Diagnostic] Assembled PDF payload length:', payloadUrl.length, 'b64 length:', fullB64.length);
    window.__bukooLoadPdf(payloadUrl);
  };

  window.__bukooLoadBookFromChunks = function (mimeType, cachedLocs) {
    var fullB64 = __bukooChunkBuffer.join('');
    __bukooChunkBuffer = [];
    var payloadUrl = 'data:' + mimeType + ';base64,' + fullB64;
    console.log('[WebView Diagnostic] Assembled EPUB payload length:', payloadUrl.length);
    window.__bukooLoadBook(payloadUrl, cachedLocs);
  };

  window.__bukooCurrentPageTurnStyle = 'horizontal';

  function animatePageTurn(dir, callback) {
    var viewer = document.getElementById('viewer');
    if (!viewer) { callback(); return; }
    var shift = dir === 'next' ? '-24px' : '24px';
    viewer.style.transition = 'transform 120ms ease-out, opacity 120ms ease-out';
    viewer.style.transform = 'translateX(' + shift + ')';
    viewer.style.opacity = '0.75';
    setTimeout(function () {
      callback();
      viewer.style.transition = 'none';
      viewer.style.transform = 'translateX(0)';
      viewer.style.opacity = '1';
      setTimeout(function () {
        viewer.style.transition = 'transform 120ms ease-out, opacity 120ms ease-out';
      }, 50);
    }, 120);
  }

  window.__bukooNext = function () {
    if (__bukooPdfState.canvases.length > 0) {
      var nextNum = Math.min(__bukooPdfState.currentNum + 1, __bukooPdfState.total);
      window.__bukooGoToPdfPage(nextNum);
    } else if (window.__bukooCurrentRendition) {
      if (window.__bukooCurrentPageTurnStyle === 'animated') {
        animatePageTurn('next', function () {
          window.__bukooCurrentRendition.next();
        });
      } else {
        window.__bukooCurrentRendition.next();
      }
    }
  };

  window.__bukooPrev = function () {
    if (__bukooPdfState.canvases.length > 0) {
      var prevNum = Math.max(__bukooPdfState.currentNum - 1, 1);
      window.__bukooGoToPdfPage(prevNum);
    } else if (window.__bukooCurrentRendition) {
      if (window.__bukooCurrentPageTurnStyle === 'animated') {
        animatePageTurn('prev', function () {
          window.__bukooCurrentRendition.prev();
        });
      } else {
        window.__bukooCurrentRendition.prev();
      }
    }
  };

  window.__bukooDisplay = function (t) {
    if (window.__bukooCurrentRendition) {
      window.__bukooCurrentRendition.display(t);
    }
  };

  window.__bukooSetTheme = function (themeObj) {
    window.__bukooCurrentTheme = themeObj;
    if (window.__bukooCurrentRendition && window.__bukooCurrentRendition.themes) {
      try { window.__bukooCurrentRendition.themes.default(themeObj); } catch (e) {}
    }
  };

  window.__bukooGoToPdfPage = function (num) {
    var targetCanvas = __bukooPdfState.canvases[num - 1];
    if (targetCanvas) {
      targetCanvas.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  function attachPdfListeners() {
    var viewer = document.getElementById('viewer');
    if (!viewer || viewer.__listenersAttached) return;
    viewer.__listenersAttached = true;

    var scrollTimeout = null;
    viewer.addEventListener('scroll', function () {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        var viewerTop = viewer.scrollTop;
        var viewerHeight = viewer.clientHeight;
        var middle = viewerTop + viewerHeight / 3;

        var current = 1;
        for (var i = 0; i < __bukooPdfState.canvases.length; i++) {
          var c = __bukooPdfState.canvases[i];
          if (c.offsetTop <= middle) {
            current = i + 1;
          } else {
            break;
          }
        }
        if (current !== __bukooPdfState.currentNum) {
          __bukooPdfState.currentNum = current;
          var percent = Math.round((current / __bukooPdfState.total) * 100);
          sendMessage({
            type: 'PAGE_CHANGED',
            page: current,
            cfi: 'pdf-page-' + current,
            percent: percent,
            chapterTitle: '',
            chapterCurrentPage: current,
            chapterTotalPages: __bukooPdfState.total
          });
        }
      }, 80);
    }, { passive: true });

    var startX = 0, startY = 0, startTime = 0;
    viewer.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startTime = Date.now();
      }
    }, { passive: true });

    viewer.addEventListener('touchend', function (e) {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      var endX = e.changedTouches[0].clientX;
      var endY = e.changedTouches[0].clientY;
      var diffX = endX - startX;
      var diffY = endY - startY;
      var duration = Date.now() - startTime;

      if (Math.abs(diffX) < 12 && Math.abs(diffY) < 12 && duration < 300) {
        var screenWidth = window.innerWidth;
        if (endX < screenWidth * 0.25) {
          window.__bukooPrev();
        } else if (endX > screenWidth * 0.75) {
          window.__bukooNext();
        } else {
          sendMessage({ type: 'TOGGLE_CONTROLS' });
        }
      }
    }, { passive: true });
  }

  function attachRenditionListeners(rendition, book) {
    rendition.on('relocated', function (location) {
      try {
        var start  = location.start;
        var cfi    = start.cfi || '';
        var page   = (start.displayed && start.displayed.page) ? start.displayed.page : 0;
        var total  = (start.displayed && start.displayed.total) ? start.displayed.total : 1;
        var pct    = book ? book.locations.percentageFromCfi(cfi) : 0;
        var percent = typeof pct === 'number' ? Math.round(pct * 100) : 0;
        var chapterTitle = '';
        var navItem = (book && book.navigation) ? book.navigation.get(start.href) : null;
        if (navItem && navItem.label) chapterTitle = navItem.label.trim();
        sendMessage({
          type: 'PAGE_CHANGED', page: page, cfi: cfi, percent: percent,
          chapterTitle: chapterTitle, chapterCurrentPage: page, chapterTotalPages: total,
        });
      } catch (e) {}
    });

    rendition.on('rendered', function (section, view) {
      if (!view || !view.document) return;
      var doc = view.document;
      var startX = 0;
      var startY = 0;
      var startTime = 0;

      doc.addEventListener('touchstart', function (e) {
        if (e.touches && e.touches.length === 1) {
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          startTime = Date.now();
        }
      }, { passive: true });

      doc.addEventListener('touchend', function (e) {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        var endX = e.changedTouches[0].clientX;
        var endY = e.changedTouches[0].clientY;
        var diffX = endX - startX;
        var diffY = endY - startY;
        var duration = Date.now() - startTime;

        var sel = doc.getSelection();
        if (sel && sel.toString() && sel.toString().trim().length > 0) {
          var selectedText = sel.toString();
          try {
            var range = sel.getRangeAt(0);
            var cfiRange = rendition.getRange(section.href).generateCfiRange(range);
            sendMessage({ type: 'TEXT_SELECTED', text: selectedText, cfi: cfiRange });
          } catch (err) {}
          return;
        }

        // Horizontal swipe gesture — only in paginated / animated mode
        if (window.__bukooCurrentPageTurnStyle !== 'vertical' && Math.abs(diffX) > 50 && Math.abs(diffY) < 60 && duration < 400) {
          if (diffX < 0) {
            window.__bukooNext();
          } else {
            window.__bukooPrev();
          }
          return;
        }

        // Tap gesture (< 12px move within 300ms)
        if (Math.abs(diffX) < 12 && Math.abs(diffY) < 12 && duration < 300) {
          var screenWidth = doc.documentElement.clientWidth || window.innerWidth;
          if (window.__bukooCurrentPageTurnStyle !== 'vertical' && endX < screenWidth * 0.25) {
            window.__bukooPrev();
          } else if (window.__bukooCurrentPageTurnStyle !== 'vertical' && endX > screenWidth * 0.75) {
            window.__bukooNext();
          } else {
            sendMessage({ type: 'TOGGLE_CONTROLS' });
          }
        }
      }, { passive: true });
    });
  }

  window.__bukooSetPageTurnStyle = function (style, currentCfi) {
    if (window.__bukooCurrentPageTurnStyle === style && window.__bukooCurrentRendition) return;
    window.__bukooCurrentPageTurnStyle = style || 'horizontal';
    var book = window.__bukooCurrentBook;
    if (!book) return;

    var flow = (style === 'vertical') ? 'scrolled-doc' : 'paginated';

    if (window.__bukooCurrentRendition) {
      try { window.__bukooCurrentRendition.destroy(); } catch (e) {}
      window.__bukooCurrentRendition = null;
    }

    var viewer = document.getElementById('viewer');
    if (viewer) viewer.innerHTML = '';

    var rendition = book.renderTo('viewer', {
      width: '100%',
      height: '100%',
      spread: 'none',
      flow: flow,
    });

    window.__bukooCurrentRendition = rendition;
    attachRenditionListeners(rendition, book);

    if (window.__bukooCurrentTheme) {
      try { rendition.themes.default(window.__bukooCurrentTheme); } catch (e) {}
    }

    if (currentCfi) {
      rendition.display(currentCfi);
    } else {
      rendition.display();
    }
  };

  // ── PDF loader — top-level, available immediately after shell loads ──
  window.__bukooLoadPdf = function (pdfUrl) {
    var viewer = document.getElementById('viewer');
    var loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';

    if (typeof pdfjsLib !== 'undefined') {
      viewer.innerHTML = '';
      viewer.__listenersAttached = false;
      viewer.style.overflow = 'auto';
      viewer.style.webkitOverflowScrolling = 'touch';
      __bukooPdfState.currentNum = 1;
      __bukooPdfState.canvases = [];

      var taskPromise;
      if (pdfUrl.startsWith('data:')) {
        var b64 = pdfUrl.split(',')[1] || '';
        var bin = window.atob(b64);
        var arr = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        taskPromise = Promise.resolve({ data: arr });
      } else if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
        taskPromise = Promise.resolve({
          url: pdfUrl,
          withCredentials: false,
          disableAutoFetch: false,
          disableStream: false,
        });
      } else {
        var bin = window.atob(pdfUrl);
        var arr = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        taskPromise = Promise.resolve({ data: arr });
      }

      taskPromise.then(function (config) {
        var loadingTask = pdfjsLib.getDocument(config);
        return loadingTask.promise;
      }).then(function (pdf) {
        __bukooPdfState.total = pdf.numPages;
        sendMessage({ type: 'TOTAL_PAGES', totalPages: pdf.numPages });
        var renderPage = function (num) {
          if (num > pdf.numPages) {
            sendMessage({ type: 'READY' });
            attachPdfListeners();
            return;
          }
          pdf.getPage(num).then(function (page) {
            var scale = (window.innerWidth - 16) / page.getViewport({ scale: 1 }).width;
            var viewport = page.getViewport({ scale: Math.max(scale, 1) });
            var canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.display = 'block';
            canvas.style.margin = '8px auto';
            canvas.style.maxWidth = '100%';
            canvas.setAttribute('data-page-num', String(num));
            viewer.appendChild(canvas);
            __bukooPdfState.canvases.push(canvas);

            page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise.then(function () {
              if (num === 1) {
                sendMessage({ type: 'READY' });
              }
              renderPage(num + 1);
            }).catch(function (renderErr) {
              console.error('[PDF.js] Render error:', renderErr);
              renderPage(num + 1);
            });
          });
        };
        renderPage(1);
      }).catch(function (err) {
        console.error('[PDF.js] Loading error:', err);
        var errStr = String(err && err.message ? err.message : err);
        sendMessage({ type: 'ERROR', error: 'PDF load failed: ' + errStr });
      });
    } else {
      sendMessage({ type: 'ERROR', error: 'PDF.js library unavailable' });
    }
  };

  // ── EPUB loader ──
  window.__bukooLoadBook = function (bookUrl, cachedLocs) {
    if (typeof ePub === 'undefined') {
      sendMessage({ type: 'ERROR', error: 'epubjs not ready' });
      return;
    }
    var loadStart = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    var isCachedLocs = !!cachedLocs;
    // Destroy previous book/rendition if any
    if (window.__bukooCurrentRendition) {
      try { window.__bukooCurrentRendition.destroy(); } catch(e) {}
      window.__bukooCurrentRendition = null;
    }
    if (window.__bukooCurrentBook) {
      try { window.__bukooCurrentBook.destroy(); } catch(e) {}
      window.__bukooCurrentBook = null;
    }
    document.getElementById('viewer').innerHTML = '';
    var loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none';

    loadBookBuffer(bookUrl).then(function (arrayBuffer) {
      var book = ePub(arrayBuffer);
      var flow = (window.__bukooCurrentPageTurnStyle === 'vertical') ? 'scrolled-doc' : 'paginated';
      var rendition = book.renderTo('viewer', {
        width: '100%',
        height: '100%',
        spread: 'none',
        flow: flow,
      });

      window.__bukooCurrentBook = book;
      window.__bukooCurrentRendition = rendition;

      rendition.display();

      var locStart = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      book.ready.then(function () {
        if (cachedLocs) {
          try {
            book.locations.load(cachedLocs);
            return Promise.resolve();
          } catch (e) {}
        }
        return book.locations.generate(1024);
      }).then(function () {
        var locEnd = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        var locDuration = Math.round(locEnd - locStart);
        var totalLoadDuration = Math.round(locEnd - loadStart);
        var total = book.spine.items ? book.spine.items.length : 0;
        var savedLocs = book.locations.save();
        sendMessage({ type: 'TOTAL_PAGES', totalPages: total, cachedLocations: savedLocs });
        sendMessage({
          type: 'READY',
          bookLoadDurationMs: totalLoadDuration,
          locationGenTimeMs: locDuration,
          cachedLocsUsed: isCachedLocs
        });
      }).catch(function (err) {
        sendMessage({ type: 'ERROR', error: String(err) });
      });

      book.loaded.navigation.then(function (nav) {
        sendMessage({ type: 'TOC', toc: nav.toc });
      });

      attachRenditionListeners(rendition, book);

      window.__bukooApplyHighlights = function (highlights) {
        if (!highlights || !Array.isArray(highlights)) return;
        highlights.forEach(function (h) {
          try {
            rendition.annotations.highlight(h.cfiRange, {}, function () {}, 'bukoo-highlight', {
              fill: h.color || 'yellow', 'fill-opacity': '0.3',
            });
          } catch (e) {}
        });
      };
    }).catch(function (err) {
      sendMessage({ type: 'ERROR', error: 'EPUB load failed: ' + String(err) });
    });
  };

  sendMessage({ type: 'SHELL_READY' });
})();
true;
`;


// Static HTML shell: contains only the JS libraries, no EPUB data.
// This NEVER changes between books — the WebView loads it once and stays alive.
// EPUB/PDF data is pushed in via injectJavaScript after the shell is ready.
function buildEpubShellHtml(
  epubJsContent: string,
  jsZipContent: string,
  pdfJsContent: string,
  pdfWorkerContent: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>BUKOO Reader</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #F4F1E8; }
    #viewer { width: 100%; height: 100%; }
    #loader { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: #F4F1E8; font-family: -apple-system, sans-serif; font-size: 15px; color: #888; }
  </style>
  <script>${jsZipContent}</script>
  <script>
    if (typeof JSZip !== 'undefined' && typeof window.JSZip === 'undefined') window.JSZip = JSZip;
  </script>
  <script>${epubJsContent}</script>
  ${pdfJsContent ? `<script>${pdfJsContent}</script>` : ''}
  <script>
    if (typeof pdfjsLib !== 'undefined') {
      if (${JSON.stringify(!!pdfWorkerContent)}) {
        try {
          var workerBlob = new Blob([${JSON.stringify(pdfWorkerContent || '')}], { type: 'text/javascript' });
          pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
        } catch (e) {
          console.error('[PDF.js] Failed to create offline worker blob:', e);
        }
      } else {
        console.error('[PDF.js] Bundled offline worker asset missing');
      }
    } else {
      console.warn('[PDF.js] Bundled PDF.js core library asset missing');
    }
  </script>
</head>
<body>
  <div id="loader">Memuat buku\u2026</div>
  <div id="viewer"></div>
  <script>${EPUB_JS_BRIDGE}</script>
</body>
</html>`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatReadingTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}j ${m}m`;
  if (m > 0) return `${m}m ${s}d`;
  return `${s}d`;
}

// ─── Theme Colors Map ─────────────────────────────────────────────────────────

const themeColors = {
  Light: {
    bg: '#FFFFFF',
    bgHeader: '#F7F7F7',
    text: '#000000',
    border: '#E2E8F0',
    statusBarStyle: 'dark-content' as const,
  },
  Cream: {
    bg: '#F4F1E8',
    bgHeader: '#EFECE2',
    text: '#1B3A2D',
    border: '#E0DACB',
    statusBarStyle: 'dark-content' as const,
  },
  Dark: {
    bg: '#1A1A1A',
    bgHeader: '#242424',
    text: '#CCCCCC',
    border: '#2A2A2A',
    statusBarStyle: 'light-content' as const,
  },
  Sepia: {
    bg: '#F5E6C8',
    bgHeader: '#EDE0C0',
    text: '#5B4636',
    border: '#E8D5B3',
    statusBarStyle: 'dark-content' as const,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface ReadingRouteParams {
  bookId: string;
  title?: string;
  localEpubUri?: string;
  epubUrl?: string;
}

export default function ReadingScreen({ navigation, route }: ReadingScreenProps) {
  const { bookId, title, localEpubUri, epubUrl } = (route.params || {}) as ReadingRouteParams;

  const { currentPage, progressPercent, readingTimeSeconds, updateProgress } =
    useReadingSession(bookId);

  const webViewRef = useRef<WebView>(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Performance metrics tracking refs
  const mountTimeRef = useRef(performance.now());
  const pageTurnStartTimeRef = useRef<number | null>(null);
  const dataInjectTimeRef = useRef<number | null>(null);

  const [controlsVisible, setControlsVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [toc, setToc] = useState<TocItem[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const handlePerformSearch = useCallback(
    async (query: string): Promise<SearchResultItem[]> => {
      const q = query.toLowerCase();
      const results: SearchResultItem[] = [];

      toc.forEach((item, idx) => {
        if (item.label && item.label.toLowerCase().includes(q)) {
          results.push({
            id: `toc_${idx}_${Date.now()}`,
            cfi: item.href,
            chapterTitle: item.label,
            excerpt: `Bab "${item.label}" sesuai dengan pencarian Anda.`,
          });
        }
      });

      return results;
    },
    [toc]
  );
  
  const [chapterInfo, setChapterInfo] = useState({
    cfi: '',
    title: '',
    currentPage: 0,
    totalPages: 1,
  });
  const [totalPages, setTotalPages] = useState<number>(0);
  const [cachedLocations, setCachedLocations] = useState<string | null>(null);

  const [theme, setTheme] = useState<'Light' | 'Cream' | 'Dark' | 'Sepia'>('Cream');
  const [fontSize, setFontSize] = useState<number>(18);
  const [fontFamily, setFontFamily] = useState<string>('DM Sans');
  const [pageTurnStyle, setPageTurnStyle] = useState<'horizontal' | 'vertical' | 'animated'>('horizontal');
  const [lineHeight, setLineHeight] = useState<number>(1.6);
  const [marginHorizontal, setMarginHorizontal] = useState<number>(20);
  const [textAlign, setTextAlign] = useState<'left' | 'justify'>('left');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [offlineCacheWarning, setOfflineCacheWarning] = useState<string | null>(null);
  const [epubJsContent, setEpubJsContent] = useState<string>(cachedEpubJsContent || '');
  const [jsZipContent, setJsZipContent] = useState<string>(cachedJsZipContent || '');
  const [pdfJsContent, setPdfJsContent] = useState<string>(cachedPdfJsContent || '');
  const [pdfWorkerContent, setPdfWorkerContent] = useState<string>(cachedPdfWorkerContent || '');

  const handleRetryLoad = useCallback(async () => {
    setLoadError(null);
    setIsReady(false);

    // Delete local cached file if it exists so we don't re-attempt loading corrupt cache
    if (bookId) {
      await bookDownloadService.deleteBook(bookId).catch(() => {});
    }

    // Force re-resolution of book to stream remotely
    setLocalFileUri('');
    const sampleBook = (MASTER_SAMPLE_BOOKS as Record<string, { epubUrl?: string; fileType?: string }>)[bookId];
    const remoteUrl = epubUrl || sampleBook?.epubUrl || '';
    if (remoteUrl) {
      setLocalFileUri(remoteUrl);
    }
  }, [bookId, epubUrl]);

  const currentCfi = chapterInfo.cfi;
  const chapterTitle = chapterInfo.title;
  const chapterCurrentPage = chapterInfo.currentPage;
  const chapterTotalPages = chapterInfo.totalPages;

  const sampleBookItem = (MASTER_SAMPLE_BOOKS as Record<string, { epubUrl?: string; fileType?: string }>)[bookId];
  const isPdf = (epubUrl || '').toLowerCase().endsWith('.pdf') ||
                sampleBookItem?.fileType === 'PDF' ||
                sampleBookItem?.epubUrl?.toLowerCase().endsWith('.pdf') ||
                (localEpubUri || '').toLowerCase().endsWith('.pdf');

  // Load cached book locations (makes book.locations.generate Instant on 2nd+ open)
  useEffect(() => {
    AsyncStorage.getItem(`epub_locations_${bookId}`).then((locs) => {
      if (locs) setCachedLocations(locs);
    }).catch(() => {});
  }, [bookId]);

  const loadHighlights = useCallback(async () => {
    const hls = await highlightService.getHighlights(bookId);
    setHighlights(hls);
  }, [bookId]);

  const handleDeleteHighlight = async (id: number) => {
    await highlightService.removeHighlight(id);
    loadHighlights();
  };

  // Load the bundled epubjs, jszip, and pdfjs assets on mount (reuses module cache if available)
  useEffect(() => {
    let isMounted = true;
    if (cachedEpubJsContent && cachedJsZipContent && cachedPdfJsContent && cachedPdfWorkerContent) {
      setEpubJsContent(cachedEpubJsContent);
      setJsZipContent(cachedJsZipContent);
      setPdfJsContent(cachedPdfJsContent);
      setPdfWorkerContent(cachedPdfWorkerContent);
      return;
    }

    const loadAssets = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const epubAsset = Asset.fromModule(require('../../assets/epub.min.txt'));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const zipAsset = Asset.fromModule(require('../../assets/jszip.min.txt'));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfAsset = Asset.fromModule(require('../../assets/pdf.min.txt'));
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfWorkerAsset = Asset.fromModule(require('../../assets/pdf.worker.min.txt'));

        await Promise.all([
          epubAsset.downloadAsync(),
          zipAsset.downloadAsync(),
          pdfAsset.downloadAsync(),
          pdfWorkerAsset.downloadAsync(),
        ]);
        
        if (epubAsset.localUri && zipAsset.localUri && pdfAsset.localUri && pdfWorkerAsset.localUri) {
          const [epubContent, zipContent, pdfContent, pdfWorkerContentStr] = await Promise.all([
            FileSystem.readAsStringAsync(epubAsset.localUri),
            FileSystem.readAsStringAsync(zipAsset.localUri),
            FileSystem.readAsStringAsync(pdfAsset.localUri),
            FileSystem.readAsStringAsync(pdfWorkerAsset.localUri),
          ]);
          cachedEpubJsContent = epubContent;
          cachedJsZipContent = zipContent;
          cachedPdfJsContent = pdfContent;
          cachedPdfWorkerContent = pdfWorkerContentStr;
          if (isMounted) {
            setEpubJsContent(epubContent);
            setJsZipContent(zipContent);
            setPdfJsContent(pdfContent);
            setPdfWorkerContent(pdfWorkerContentStr);
          }
        }
      } catch (e) {
        console.error('[ReadingScreen] Failed to load epubjs/jszip assets:', e);
      }
    };
    loadAssets();
    return () => { isMounted = false; };
  }, []);

  // Load the EPUB/PDF file URI so it can be passed directly to the WebView.
  // Serves the file via direct file:// URL (or remote HTTPS URL if downloading).
  // Zero Base64 string memory duplication!
  const [localFileUri, setLocalFileUri] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const resolveAndLoadBook = async () => {
      try {
        const sampleBook = (MASTER_SAMPLE_BOOKS as Record<string, { epubUrl?: string; fileType?: string }>)[bookId];
        const remoteUrl = epubUrl || sampleBook?.epubUrl || '';

        // Check if file already exists locally on disk
        let uri: string | null = localEpubUri || null;
        if (!uri && bookId) {
          uri = await bookDownloadService.getLocalBookPath(bookId);
        }

        // IMMEDIATELY set initialUri for streaming — zero blocking delay!
        const initialUri = uri || remoteUrl;
        if (initialUri && isMounted) {
          console.log('[ReadingScreen] Immediate book URI for streaming:', initialUri);
          setLocalFileUri(initialUri);
        }

        // Trigger background download for offline caching if not cached yet
        if (!uri && bookId && remoteUrl) {
          console.log('[ReadingScreen] Initiating background download for offline cache...');
          bookDownloadService.downloadBook(bookId, remoteUrl)
            .then((downloadedUri) => {
              if (downloadedUri && isMounted) {
                console.log('[ReadingScreen] Background download finished:', downloadedUri);
              }
            })
            .catch((err) => {
              console.warn('[ReadingScreen] Background download warning:', err);
              if (isMounted) {
                setOfflineCacheWarning('Gagal mengunduh versi offline. Membaca melalui streaming.');
                setTimeout(() => {
                  if (isMounted) setOfflineCacheWarning(null);
                }, 5000);
              }
            });
        }
      } catch (e) {
        console.error('[ReadingScreen] Failed to resolve book:', e);
      }
    };

    resolveAndLoadBook();
    return () => { isMounted = false; };
  }, [bookId, localEpubUri, epubUrl]);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('reader_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.theme) setTheme(parsed.theme);
          if (parsed.fontSize) setFontSize(parsed.fontSize);
          if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
          if (parsed.pageTurnStyle) setPageTurnStyle(parsed.pageTurnStyle);
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    };
    loadPreferences();
  }, []);

  const loadBookmarks = useCallback(async () => {
    const bms = await bookmarkService.getBookmarks(bookId);
    setBookmarks(bms);
  }, [bookId]);

  useEffect(() => {
    loadBookmarks();
    loadHighlights();
  }, [loadBookmarks, loadHighlights]);

  useEffect(() => {
    if (isReady && webViewRef.current) {
      const js = `if (window.__bukooApplyHighlights) window.__bukooApplyHighlights(${JSON.stringify(highlights)}); true;`;
      webViewRef.current.injectJavaScript(js);
    }
  }, [highlights, isReady]);

  // Load initial global reader settings from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem('reader_settings').then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.theme) setTheme(parsed.theme);
          if (parsed.fontSize) setFontSize(parsed.fontSize);
          if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
          if (parsed.pageTurnStyle) setPageTurnStyle(parsed.pageTurnStyle);
          if (parsed.lineHeight) setLineHeight(parsed.lineHeight);
          if (parsed.marginHorizontal) setMarginHorizontal(parsed.marginHorizontal);
          if (parsed.textAlign) setTextAlign(parsed.textAlign);
        } catch (e) {
          console.warn('[ReadingScreen] Failed to parse stored settings:', e);
        }
      }
    }).catch(() => {});
  }, []);

  // Sync typography, theme, and layout settings to WebView and AsyncStorage
  useEffect(() => {
    if (!isReady || !webViewRef.current) return;

    const timer = setTimeout(() => {
      const themes = {
        Light: { body: { background: '#FFFFFF', color: '#000000', 'font-size': `${fontSize}px`, 'font-family': fontFamily, 'line-height': `${lineHeight}`, 'padding-left': `${marginHorizontal}px`, 'padding-right': `${marginHorizontal}px`, 'text-align': textAlign } },
        Cream: { body: { background: '#F4F1E8', color: '#1B3A2D', 'font-size': `${fontSize}px`, 'font-family': fontFamily, 'line-height': `${lineHeight}`, 'padding-left': `${marginHorizontal}px`, 'padding-right': `${marginHorizontal}px`, 'text-align': textAlign } },
        Dark: { body: { background: '#1A1A1A', color: '#CCCCCC', 'font-size': `${fontSize}px`, 'font-family': fontFamily, 'line-height': `${lineHeight}`, 'padding-left': `${marginHorizontal}px`, 'padding-right': `${marginHorizontal}px`, 'text-align': textAlign } },
        Sepia: { body: { background: '#F5E6C8', color: '#5B4636', 'font-size': `${fontSize}px`, 'font-family': fontFamily, 'line-height': `${lineHeight}`, 'padding-left': `${marginHorizontal}px`, 'padding-right': `${marginHorizontal}px`, 'text-align': textAlign } },
      };
      
      const themeObj = themes[theme];
      const js = `
        if (window.__bukooSetTheme) window.__bukooSetTheme(${JSON.stringify(themeObj)});
        if (window.__bukooSetPageTurnStyle && !${isPdf}) window.__bukooSetPageTurnStyle(${JSON.stringify(pageTurnStyle)}, ${JSON.stringify(currentCfi)});
        true;
      `;
      webViewRef.current?.injectJavaScript(js);
      
      AsyncStorage.setItem('reader_settings', JSON.stringify({
        theme,
        fontSize,
        fontFamily,
        pageTurnStyle,
        lineHeight,
        marginHorizontal,
        textAlign,
      })).catch(console.error);
    }, 150);

    return () => clearTimeout(timer);
  }, [theme, fontSize, fontFamily, pageTurnStyle, lineHeight, marginHorizontal, textAlign, isReady, isPdf, currentCfi]);

  const toggleBookmark = async () => {
    if (!currentCfi) return;
    const isBookmarked = await bookmarkService.isBookmarked(bookId, currentCfi);
    if (isBookmarked) {
      await bookmarkService.removeBookmark(bookId, currentCfi);
    } else {
      await bookmarkService.addBookmark(bookId, currentCfi, chapterTitle || 'Unknown Chapter');
    }
    loadBookmarks();
  };

  const jumpToLocation = (target: string) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`if (window.__bukooDisplay) window.__bukooDisplay('${target}'); true;`);
    }
    setShowToc(false);
    setShowBookmarks(false);
    setShowHighlights(false);
  };

  // ── Auto-hide controls after 3 seconds of inactivity ─────────────────────

  const scheduleHideControls = useCallback(() => {
    if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
    controlsHideTimer.current = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => setControlsVisible(false));
    }, 3000);
  }, [controlsOpacity]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    scheduleHideControls();
  }, [controlsOpacity, scheduleHideControls]);

  const handleLeftTap = useCallback(() => {
    pageTurnStartTimeRef.current = performance.now();
    webViewRef.current?.injectJavaScript('window.__bukooPrev && window.__bukooPrev(); true;');
  }, []);

  const handleRightTap = useCallback(() => {
    pageTurnStartTimeRef.current = performance.now();
    webViewRef.current?.injectJavaScript('window.__bukooNext && window.__bukooNext(); true;');
  }, []);

  const handleCenterTap = useCallback(() => {
    if (controlsVisible) {
      if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setControlsVisible(false));
    } else {
      showControls();
    }
  }, [controlsVisible, controlsOpacity, showControls]);

  // Suspend auto-hide timer when reader modals are open
  const isAnyModalOpen = showToc || showSettings || showBookmarks || showHighlights || showSearch;

  useEffect(() => {
    if (isAnyModalOpen) {
      if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
      setControlsVisible(true);
      controlsOpacity.setValue(1);
    } else {
      scheduleHideControls();
    }
  }, [isAnyModalOpen, scheduleHideControls, controlsOpacity]);

  // ── WebView message handler ───────────────────────────────────────────────

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg: EpubMessage & { cachedLocations?: string } = JSON.parse(event.nativeEvent.data);
        switch (msg.type) {
          case 'READY': {
            setIsReady(true);
            const totalTtff = Math.round(performance.now() - mountTimeRef.current);
            console.log(
              `[Perf] Total Time-to-First-Frame: ${totalTtff}ms` +
              (msg.bookLoadDurationMs ? `, In-WebView load: ${msg.bookLoadDurationMs}ms` : '') +
              (msg.locationGenTimeMs !== undefined ? `, Location gen (${msg.cachedLocsUsed ? 'cached' : 'generated'}): ${msg.locationGenTimeMs}ms` : '')
            );
            break;
          }
          case 'TOTAL_PAGES':
            if (msg.totalPages !== undefined) setTotalPages(msg.totalPages);
            if (msg.cachedLocations) {
              AsyncStorage.setItem(`epub_locations_${bookId}`, msg.cachedLocations).catch(() => {});
            }
            break;
          case 'TOC':
            if (msg.toc) setToc(msg.toc);
            break;
          case 'PAGE_CHANGED':
            if (pageTurnStartTimeRef.current !== null) {
              const latency = Math.round(performance.now() - pageTurnStartTimeRef.current);
              console.log(`[Perf] Page turn latency: ${latency}ms`);
              pageTurnStartTimeRef.current = null;
            }
            if (msg.page !== undefined && msg.cfi !== undefined) {
              setChapterInfo({
                cfi: msg.cfi,
                title: msg.chapterTitle || '',
                currentPage: msg.chapterCurrentPage ?? 0,
                totalPages: msg.chapterTotalPages ?? 1,
              });
              updateProgress(msg.page, msg.cfi, msg.percent);
            }
            break;
          case 'TEXT_SELECTED':
            if (msg.text && msg.cfi) {
              highlightService.addHighlight(
                bookId,
                msg.cfi,
                msg.text,
                'rgba(250,204,21,0.4)'
              ).then(() => loadHighlights());
            }
            break;
          case 'TOGGLE_CONTROLS':
            handleCenterTap();
            break;
          case 'ERROR': {
            console.warn('[ReadingScreen] WebView error:', msg.error);
            const errStr = msg.error || 'Gagal memuat buku';
            setLoadError(errStr);
            break;
          }
          case 'SHELL_READY':
            // Bridge script is ready — try injecting book data if available
            webViewShellReady.current = true;
            console.log(`[Perf] WebView shell ready duration: ${Math.round(performance.now() - mountTimeRef.current)}ms`);
            break;
          default:
            break;
        }
      } catch (e) {
        console.warn('[ReadingScreen] Failed to parse WebView message:', e);
      }
    },
    [bookId, updateProgress, handleCenterTap, loadHighlights]
  );

  // Static HTML shell: depends only on the JS libraries, never on the EPUB file.
  // This means the WebView loads ONCE — switching books just calls __bukooLoadBook().
  const epubShellHtml = useMemo(
    () => (epubJsContent && jsZipContent) ? buildEpubShellHtml(epubJsContent, jsZipContent, pdfJsContent, pdfWorkerContent) : '',
    [epubJsContent, jsZipContent, pdfJsContent, pdfWorkerContent]
  );

  // When everything is ready, inject the EPUB data into the already-loaded WebView
  const webViewShellReady = useRef(false);

  // True when we have a local or remote book URI ready to inject
  const hasBookData = !!localFileUri;

  const injectBookData = useCallback(async () => {
    if (!webViewRef.current || !localFileUri) return;
    dataInjectTimeRef.current = performance.now();

    const isLocalFile = localFileUri.startsWith('file://') || localFileUri.startsWith('/');

    if (isLocalFile) {
      try {
        const readStart = performance.now();
        const fileInfo = await FileSystem.getInfoAsync(localFileUri);
        const diskFileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

        const b64 = await FileSystem.readAsStringAsync(localFileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const readDuration = Math.round(performance.now() - readStart);

        console.log(`[RN Diagnostic] Disk size: ${diskFileSize} bytes | b64 length: ${b64.length} chars | RN Read duration: ${readDuration}ms`);

        const CHUNK_SIZE = 256 * 1024; // 256KB per chunk
        const totalChunks = Math.ceil(b64.length / CHUNK_SIZE);
        const mimeType = isPdf ? 'application/pdf' : 'application/epub+zip';

        console.log(`[Chunking] Transferring ${totalChunks} chunks (${CHUNK_SIZE}B each) to WebView bridge...`);

        // Reset WebView chunk buffer
        webViewRef.current.injectJavaScript('if (window.__bukooResetChunks) window.__bukooResetChunks(); true;');

        // Push chunks sequentially
        for (let i = 0; i < totalChunks; i++) {
          const chunk = b64.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          webViewRef.current.injectJavaScript(
            `if (window.__bukooPushChunk) window.__bukooPushChunk(${JSON.stringify(chunk)}); true;`
          );
        }

        // Finalize load from chunk buffer
        const locsArg = cachedLocations ? JSON.stringify(cachedLocations) : 'null';
        if (isPdf) {
          webViewRef.current.injectJavaScript(
            `if (window.__bukooLoadPdfFromChunks) window.__bukooLoadPdfFromChunks(${JSON.stringify(mimeType)}); true;`
          );
        } else {
          webViewRef.current.injectJavaScript(
            `if (window.__bukooLoadBookFromChunks) window.__bukooLoadBookFromChunks(${JSON.stringify(mimeType)}, ${locsArg}); true;`
          );
        }
        return;
      } catch (err) {
        console.error('[ReadingScreen] Failed to read or chunk local file in RN:', err);
      }
    } else {
      console.log('[Perf] Using remote URL for streaming directly:', localFileUri);
    }

    // Remote HTTP/HTTPS URL path
    if (isPdf) {
      webViewRef.current.injectJavaScript(
        `(function(){
          if (window.__bukooLoadPdf) {
            window.__bukooLoadPdf(${JSON.stringify(localFileUri)});
          }
        })(); true;`
      );
    } else {
      const locsArg = cachedLocations ? JSON.stringify(cachedLocations) : 'null';
      webViewRef.current.injectJavaScript(
        `(function(){
          var bookUrl = ${JSON.stringify(localFileUri)};
          var locs = ${locsArg};
          if (window.__bukooLoadBook) {
            window.__bukooLoadBook(bookUrl, locs);
          }
        })(); true;`
      );
    }
  }, [isPdf, localFileUri, cachedLocations]);

  // Called when the WebView's initial HTML has fully loaded and executed
  const handleWebViewLoad = useCallback(() => {
    webViewShellReady.current = true;
    if (hasBookData) injectBookData();
  }, [hasBookData, injectBookData]);

  // Re-inject when book data arrives after the shell is ready
  useEffect(() => {
    if (webViewShellReady.current && hasBookData) injectBookData();
  }, [hasBookData, injectBookData]);

  // Hide the in-WebView loader once epubjs fires READY
  useEffect(() => {
    if (isReady && webViewRef.current) {
      webViewRef.current.injectJavaScript(
        `var l=document.getElementById('loader'); if(l) l.style.display='none'; true;`
      );
    }
  }, [isReady]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const WebViewComponent = WebView as unknown as React.ComponentType<any>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors[theme].bg }]} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={themeColors[theme].statusBarStyle}
        backgroundColor={themeColors[theme].bgHeader}
        translucent={false}
      />

      {/* ── Progress bar (always visible, 2px) ── */}
      <View style={[styles.progressBarTrack, { backgroundColor: themeColors[theme].border }]}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* ── Header (animated show/hide) ── */}
      {controlsVisible && (
        <Animated.View style={[styles.header, { opacity: controlsOpacity, backgroundColor: themeColors[theme].bgHeader, borderBottomColor: themeColors[theme].border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Kembali"
          >
            <Ionicons name="chevron-back" size={28} color={themeColors[theme].text} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: themeColors[theme].text, fontFamily: FONTS.sansBold }]} numberOfLines={1}>
              {chapterTitle || title}
            </Text>
            <View style={styles.headerMeta}>
              <Text style={[styles.headerSubtitle, { color: themeColors[theme].text + '99', fontFamily: FONTS.sansRegular }]} numberOfLines={1}>
                {isReady && chapterTotalPages > 0 
                  ? `${chapterTotalPages - chapterCurrentPage} hal. tersisa` 
                  : '…'}
              </Text>
              <Text style={[styles.headerMetaDivider, { color: themeColors[theme].text + '77' }]}>·</Text>
              <Text style={[styles.headerSubtitle, { color: themeColors[theme].text + '99', fontFamily: FONTS.sansRegular }]} numberOfLines={1}>
                {formatReadingTime(readingTimeSeconds)}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity style={styles.headerAction} onPress={() => setShowSearch(true)} accessibilityLabel="Cari dalam buku">
              <Ionicons name="search-outline" size={22} color={themeColors[theme].text} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerAction} onPress={() => setShowHighlights(true)} accessibilityLabel="Sorotan & Catatan">
              <Ionicons name="create-outline" size={22} color={themeColors[theme].text} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerAction} onPress={toggleBookmark} accessibilityLabel="Markah">
              <Ionicons 
                name={bookmarks.some(b => b.cfi === currentCfi) ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={bookmarks.some(b => b.cfi === currentCfi) ? COLORS.ember : themeColors[theme].text} 
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* ── Offline cache warning banner ── */}
      {offlineCacheWarning && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
          <Text style={styles.offlineBannerText}>{offlineCacheWarning}</Text>
        </View>
      )}

      {/* ── WebView ── */}
      <View style={styles.webViewContainer} renderToHardwareTextureAndroid={true}>
        {loadError ? (
          <View style={[styles.errorContainer, { backgroundColor: themeColors[theme].bg }]}>
            <Ionicons name="alert-circle-outline" size={56} color={COLORS.ember} />
            <Text style={[styles.errorTitle, { color: themeColors[theme].text, fontFamily: FONTS.sansBold }]}>
              Gagal Memuat Buku
            </Text>
            <Text style={[styles.errorMessage, { color: themeColors[theme].text + 'BB', fontFamily: FONTS.sansRegular }]}>
              {loadError.toLowerCase().includes('pdf') || loadError.toLowerCase().includes('zip') || loadError.toLowerCase().includes('invalid') || loadError.toLowerCase().includes('corrupt')
                ? 'Berkas buku lokal tidak valid atau mengalami kerusakan. Silakan tekan Coba Lagi untuk menghapus cache dan membaca ulang.'
                : loadError.toLowerCase().includes('network') || loadError.toLowerCase().includes('host') || loadError.toLowerCase().includes('connect') || loadError.toLowerCase().includes('timeout')
                ? 'Koneksi internet bermasalah. Periksa jaringan Anda dan coba lagi.'
                : loadError}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetryLoad}
              accessibilityRole="button"
              accessibilityLabel="Coba Lagi"
            >
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : !epubShellHtml ? (
          <View style={styles.loaderContainer}>
            <Text style={styles.loaderText}>Memuat pembaca buku…</Text>
          </View>
        ) : (
          <WebViewComponent
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: epubShellHtml, baseUrl: 'about:blank' }}
            onMessage={handleMessage}
            onLoad={handleWebViewLoad}
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess
            allowUniversalAccessFromFileURLs
            mixedContentMode="always"
            style={styles.webView}
            allowFileAccessFromFileURLs={Platform.OS === 'android'}
            onError={(e: { nativeEvent: { description: string } }) => {
              console.error('[ReadingScreen] WebView error:', e.nativeEvent.description);
              setLoadError(e.nativeEvent.description || 'Gagal memuat WebView');
            }}
          />
        )}

        {/* ── Tap zones (invisible overlays) — skipped in PDF mode and vertical EPUB mode to allow native WebView scrolling ── */}
        {!isPdf && pageTurnStyle !== 'vertical' && (
          <View style={styles.tapZoneRow} pointerEvents="box-none">
            {/* Left 30% — previous page */}
            <TouchableOpacity
              style={styles.tapLeft}
              activeOpacity={1}
              onPress={handleLeftTap}
              accessibilityLabel="Halaman sebelumnya"
            />

            {/* Center 40% — toggle controls */}
            <TouchableOpacity
              style={styles.tapCenter}
              activeOpacity={1}
              onPress={handleCenterTap}
              accessibilityLabel="Tampilkan / sembunyikan kontrol"
            />

            {/* Right 30% — next page */}
            <TouchableOpacity
              style={styles.tapRight}
              activeOpacity={1}
              onPress={handleRightTap}
              accessibilityLabel="Halaman berikutnya"
            />
          </View>
        )}
      </View>

      {/* ── Bottom bar (animated show/hide) ── */}
      {controlsVisible && (
        <Animated.View style={[styles.bottomBar, { opacity: controlsOpacity, backgroundColor: themeColors[theme].bgHeader, borderTopColor: themeColors[theme].border }]}>
          <TouchableOpacity
            style={styles.navTextButton}
            onPress={handleLeftTap}
            accessibilityLabel="Halaman sebelumnya"
          >
            <Ionicons name="arrow-back" size={18} color={themeColors[theme].text} />
            <Text style={[styles.navTextButtonText, { color: themeColors[theme].text }]}>Prev</Text>
          </TouchableOpacity>

          <View style={styles.pageCounter}>
            <Text style={[styles.pageCounterText, { color: themeColors[theme].text, fontFamily: FONTS.serifBold }]}>
              Halaman {currentPage > 0 ? currentPage : 62}/{totalPages > 0 ? totalPages : 271}
            </Text>
            <Text style={[styles.pageCounterSubtext, { color: COLORS.muted, fontFamily: FONTS.sansRegular }]}>
              {progressPercent > 0 ? progressPercent : 34}% Selesai
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navTextButton}
            onPress={handleRightTap}
            accessibilityLabel="Halaman berikutnya"
          >
            <Text style={[styles.navTextButtonText, { color: themeColors[theme].text }]}>Next</Text>
            <Ionicons name="arrow-forward" size={18} color={themeColors[theme].text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navIconButton} onPress={() => setShowToc(true)} accessibilityLabel="Daftar Isi">
            <Ionicons name="menu-outline" size={22} color={themeColors[theme].text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navIconButton} onPress={() => setShowSettings(true)} accessibilityLabel="Pengaturan Tampilan">
            <Ionicons name="options-outline" size={22} color={themeColors[theme].text} />
          </TouchableOpacity>
        </Animated.View>
      )}


      {/* ── Modular Component Modals ── */}
      <TocModal
        visible={showToc}
        onClose={() => setShowToc(false)}
        toc={toc}
        currentChapterHref={currentCfi}
        onSelectLocation={jumpToLocation}
      />

      <SearchModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        bookTitle={title}
        onPerformSearch={handlePerformSearch}
        onSelectResult={jumpToLocation}
      />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        theme={(theme.toLowerCase() === 'cream' ? 'cream' : theme.toLowerCase() === 'light' ? 'light' : theme.toLowerCase() === 'sepia' ? 'sepia' : 'dark') as ReaderTheme}
        setTheme={(t) => {
          const cap = (t.charAt(0).toUpperCase() + t.slice(1)) as 'Light' | 'Cream' | 'Dark' | 'Sepia';
          setTheme(cap);
        }}
        lineHeight={lineHeight}
        setLineHeight={setLineHeight}
        marginHorizontal={marginHorizontal}
        setMarginHorizontal={setMarginHorizontal}
        textAlign={textAlign}
        setTextAlign={setTextAlign}
      />

      <HighlightModal
        visible={showHighlights}
        onClose={() => setShowHighlights(false)}
        highlights={highlights.map((h) => ({
          id: String(h.id),
          cfi: h.cfiRange,
          text: h.text,
          color: h.color,
          note: h.note,
          createdAt: h.createdAt,
        }))}
        onRemoveHighlight={(id) => handleDeleteHighlight(Number(id))}
        onSaveNote={(id, note) => {
          highlightService.updateNote(Number(id), note).then(() => {
            if (bookId) highlightService.getHighlights(bookId).then(setHighlights);
          });
        }}
        onSelectHighlight={jumpToLocation}
      />
    </SafeAreaView>
  );
}

// ─── Design tokens ────────────────────────────────────────────────────────────



// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  // Progress bar
  progressBarTrack: {
    height: 2,
    width: '100%',
    backgroundColor: COLORS.sand,
  },
  progressBarFill: {
    height: 2,
    backgroundColor: COLORS.ember,
    minWidth: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.creamLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sand,
  },
  backButton: {
    paddingRight: 12,
    paddingVertical: 4,
  },
  backIcon: {
    fontSize: 28,
    color: COLORS.forest,
    lineHeight: 30,
    fontWeight: '300',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.forest,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMetaDivider: {
    fontSize: 12,
    color: COLORS.sand,
    marginHorizontal: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
  },
  headerAction: {
    paddingLeft: 12,
    paddingVertical: 4,
  },
  bookmarkIcon: {
    fontSize: 22,
    color: COLORS.muted,
    opacity: 0.5,
  },
  bookmarkIconActive: {
    opacity: 1,
  },

  // WebView
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cream,
  },
  loaderText: {
    color: COLORS.muted,
    fontSize: 15,
  },

  // Tap zones
  tapZoneRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  tapLeft: {
    width: '30%',
    height: '100%',
  },
  tapCenter: {
    width: '40%',
    height: '100%',
  },
  tapRight: {
    width: '30%',
    height: '100%',
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.creamLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.sand,
  },
  navIconButton: {
    padding: 6,
  },
  navTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 4,
  },
  navTextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  navIconText: {
    fontSize: 24,
    color: COLORS.forest,
  },
  pageCounter: {
    flex: 1,
    alignItems: 'center',
  },
  pageCounterText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
  },
  pageCounterSubtext: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    marginTop: 2,
  },


  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.creamLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.forest,
  },
  modalClose: {
    fontSize: 16,
    color: COLORS.ember,
    fontWeight: '600',
  },
  tocItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sand,
  },
  tocItemText: {
    fontSize: 16,
    color: COLORS.forest,
  },
  bookmarkDateText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.muted,
    marginTop: 20,
  },
  
  // Settings specific
  settingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.muted,
    marginBottom: 10,
    marginTop: 10,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  themeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeActive: {
    borderColor: COLORS.ember,
  },
  fontRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  fontButton: {
    padding: 10,
    backgroundColor: 'rgba(27, 58, 45, 0.08)',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  fontButtonText: {
    fontSize: 18,
    color: COLORS.forest,
  },
  fontSizeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.forest,
  },
  fontFamilyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fontFamilyButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.sand,
  },
  fontFamilyButtonActive: {
    backgroundColor: COLORS.forest,
    borderColor: COLORS.forest,
  },
  fontFamilyText: {
    color: COLORS.forest,
    fontSize: 14,
  },
  fontFamilyTextActive: {
    color: COLORS.creamLight,
  },
  selectedSnippet: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.forest,
    backgroundColor: COLORS.cream,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.ember,
    marginVertical: 10,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: COLORS.sand,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    color: COLORS.forest,
    backgroundColor: COLORS.creamLight,
    marginTop: 5,
  },
  saveHighlightButton: {
    backgroundColor: COLORS.forest,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    width: '100%',
  },
  saveHighlightButtonText: {
    color: COLORS.creamLight,
    fontWeight: 'bold',
    fontSize: 16,
  },
  highlightListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sand,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  highlightListText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.forest,
    flex: 1,
  },
  highlightListNote: {
    fontSize: 14,
    color: COLORS.forest,
    backgroundColor: COLORS.cream,
    padding: 6,
    borderRadius: 4,
    marginVertical: 4,
  },
  deleteHighlightAction: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(200, 84, 31, 0.1)',
  },
  deleteHighlightText: {
    fontSize: 13,
    color: COLORS.ember,
    fontWeight: '600',
  },
  offlineBanner: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 99,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  offlineBannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONTS.sansMedium,
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  errorTitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.ember,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONTS.sansBold,
  },
});
