import { createAction, createReducer } from 'redux-act';

import { FetchStatusFlag } from 'app/constants';
import {
  BookDetailResponse,
  BookDetailResponseV1,
  BookDetailResponseV2,
} from 'app/services/book/requests';
import { RGB } from 'app/services/commonUI';
import { BookId, DateDTO } from 'app/types';

export * from './utils';

export const Actions = {
  initializeBooks: createAction<{
    staticBookState: LocalStorageStaticBookState;
  }>('initializeBooks'),
  updateBooks: createAction<{
    books: Book[];
  }>('updateBooks'),
  loadBookDetailRequest: createAction<{
    bookId: BookId;
  }>('loadBookDetailRequest'),
  loadBookDetailSuccess: createAction<{
    bookId: BookId;
    bookDetail: BookDetailResponse;
  }>('loadBookDetailSuccess'),
  loadBookDetailFailure: createAction<{
    bookId: BookId;
  }>('loadBookDetailFailure'),
  loadBookOwnershipRequest: createAction<{
    bookId: BookId;
  }>('loadBookOwnershipRequest'),
  loadBookOwnershipSuccess: createAction<{
    bookId: BookId;
    ownershipStatus: BookOwnershipStatus;
  }>('loadBookOwnershipSuccess'),
  loadBookOwnershipFailure: createAction<{
    bookId: BookId;
  }>('loadBookOwnershipFailure'),
  clearBookOwnership: createAction<{
    bookIds: BookId[];
  }>('clearBookOwnership'),
  loadBookToBookRecommendationRequest: createAction<{
    bookId: BookId;
  }>('loadBookToBookRecommendationRequest'),
  loadBookToBookRecommendationSuccess: createAction<{
    bookId: BookId;
    recommendedBooks: Book[];
  }>('loadBookToBookRecommendationSuccess'),
  loadBookToBookRecommendationFailure: createAction<{
    bookId: BookId;
  }>('loadBookToBookRecommendationFailure'),
  updateDominantColor: createAction<{
    bookId: BookId;
    color: RGB;
  }>('updateDominantColor'),
};

export enum AuthorKeys {
  'author' = 'author',
  'comicAuthor' = 'comicAuthor',
  'storyWriter' = 'storyWriter',
  'translator' = 'translator',
  'illustrator' = 'illustrator',
  'originalAuthor' = 'originalAuthor',
  'authorPhoto' = 'authorPhoto',
  'adapter' = 'adapter',
}
export const authorKeys: AuthorKeys[] = [
  AuthorKeys.author,
  AuthorKeys.comicAuthor,
  AuthorKeys.storyWriter,
  AuthorKeys.translator,
  AuthorKeys.illustrator,
  AuthorKeys.originalAuthor,
  AuthorKeys.authorPhoto,
  AuthorKeys.adapter,
];
export const authorKoreanNames = {
  [AuthorKeys.author]: '저',
  [AuthorKeys.comicAuthor]: '글, 그림',
  [AuthorKeys.storyWriter]: '글',
  [AuthorKeys.translator]: '역',
  [AuthorKeys.illustrator]: '그림',
  [AuthorKeys.originalAuthor]: '원작',
  [AuthorKeys.authorPhoto]: '사진',
  [AuthorKeys.adapter]: '각색',
};

export interface BookAuthor {
  id?: number;
  name: string;
}

export interface BookAuthors {
  [role: string]: BookAuthor[];
}

export interface BookTitle {
  main: string;
  sub?: string;
  prefix?: string;
}

export interface BookReviewSummary {
  buyerRatingAverage: number;
  buyerRatingCount: number;
  buyerRatingDistribution: number[];
  buyerReviewCount: number;
  totalRatingCount: number;
  totalReviewCount: number;
}

// TODO 도서들 coverImageSrc로 전환 마치면 제거
export interface BookThumbnailUrlMap {
  small?: string;
  large?: string;
  xxlarge?: string;
}

export interface Book {
  id: BookId;
  title: BookTitle;
  thumbnail: BookThumbnailUrlMap;
  authors: BookAuthors;
  reviewSummary?: BookReviewSummary;
  beginDatetime: DateDTO;
  endDatetime: DateDTO;
}

export interface BookOwnershipStatus {
  isCurrentlyUsedRidiSelectBook: boolean;
  isDownloadAvailable: boolean;
}

export interface StaticBookState {
  book?: Book;
  bookDetail?: BookDetailResponse;
  recommendedBooks?: Book[];
  dominantColor?: RGB;
}

export interface LegacyStaticBookState {
  book?: Book;
  bookDetail?: BookDetailResponseV1 | BookDetailResponseV2;
  dominantColor?: RGB;
}

export interface LocalStorageStaticBookState {
  [bookId: number]: LegacyStaticBookState;
}

export interface BookStateItem extends StaticBookState {
  detailFetchStatus: FetchStatusFlag;
  bookToBookRecommendationFetchStatus: FetchStatusFlag;
  ownershipFetchStatus: FetchStatusFlag;
  ownershipStatus?: BookOwnershipStatus;
}

export interface BookState {
  [bookId: number]: BookStateItem;
}

export const INITIAL_BOOK_STATE: BookState = {};

export const bookReducer = createReducer<typeof INITIAL_BOOK_STATE>({}, INITIAL_BOOK_STATE);

bookReducer.on(Actions.initializeBooks, (state, action) => {
  const staticBookState: LocalStorageStaticBookState = action;
  return {
    ...state,
    ...Object.keys(staticBookState).reduce((prev, bookId): BookState => {
      const id = Number(bookId);
      return {
        ...prev,
        [id]: {
          ...staticBookState[id],
          detailFetchStatus: FetchStatusFlag.IDLE,
        },
      };
    }, {}),
  };
});

bookReducer.on(Actions.updateBooks, (state, action) => {
  const { books = [] } = action;
  const newState: BookState = books.reduce((prev, book) => {
    // Data 팀에서 전달되어 넘어오는 Book DTO 내의 authors 형태가 기존에 사용하던 데이터와 달라서
    // 잘못된 형태로 Book data의 authors 정보가 override 되고 있는 부분에 대한 대응
    // TODO: Data팀, 셀렉트 백엔드 팀과 이야기 하여 형태 통일 후 해당 처리 제거 필요
    if (Array.isArray(book.authors)) {
      book.authors = { author: book.authors };
    }
    prev[book.id] = {
      ...state[book.id],
      detailFetchStatus: state[book.id] ? state[book.id].detailFetchStatus : FetchStatusFlag.IDLE,
      ownershipFetchStatus: state[book.id]
        ? state[book.id].ownershipFetchStatus
        : FetchStatusFlag.IDLE,
      book: state[book.id] ? { ...state[book.id].book, ...book } : book,
    };
    return prev;
  }, state);
  return newState;
});

bookReducer.on(Actions.loadBookDetailRequest, (state, action) => {
  const { bookId } = action;
  const book = state[bookId];
  return {
    ...state,
    [bookId]: {
      ...state[bookId],
      detailFetchStatus: FetchStatusFlag.FETCHING,
      ownershipFetchStatus: state[bookId]
        ? state[bookId].ownershipFetchStatus
        : FetchStatusFlag.IDLE,
      bookDetail: !!book && book.bookDetail ? state[bookId].bookDetail : undefined,
    },
  };
});

bookReducer.on(Actions.loadBookDetailSuccess, (state, action) => {
  const { bookId, bookDetail } = action;
  return {
    ...state,
    [bookId]: {
      ...state[bookId],
      detailFetchStatus: FetchStatusFlag.IDLE,
      bookDetail: {
        ...bookDetail,
      },
    },
  };
});

bookReducer.on(Actions.loadBookDetailFailure, (state, action) => {
  const { bookId } = action;
  return {
    ...state,
    [bookId]: {
      ...state[bookId],
      detailFetchStatus: FetchStatusFlag.FETCH_ERROR,
    },
  };
});

bookReducer.on(Actions.loadBookOwnershipRequest, (state, action) => {
  const { bookId } = action;
  return {
    ...state,
    [bookId]: {
      ...state[bookId],
      ownershipFetchStatus: FetchStatusFlag.FETCHING,
    },
  };
});

bookReducer.on(Actions.loadBookOwnershipSuccess, (state, action) => {
  const { bookId, ownershipStatus } = action;
  return {
    ...state,
    [bookId]: {
      ...state[bookId],
      ownershipFetchStatus: FetchStatusFlag.IDLE,
      ownershipStatus,
    },
  };
});

bookReducer.on(Actions.loadBookOwnershipFailure, (state, action) => {
  const { bookId } = action;
  return {
    ...state,
    [bookId]: {
      ...state[bookId],
      ownershipFetchStatus: FetchStatusFlag.FETCH_ERROR,
    },
  };
});

bookReducer.on(Actions.clearBookOwnership, (state, action) => {
  const { bookIds } = action;
  return bookIds.reduce(
    (newState, bookId) => ({
      ...newState,
      [bookId]: {
        ...newState[bookId],
        ownershipStatus: undefined,
      },
    }),
    state,
  );
});

bookReducer.on(Actions.updateDominantColor, (state, action) => {
  const { bookId, color } = action;
  return {
    ...state,
    [bookId]: {
      ...state[bookId],
      dominantColor: color,
    },
  };
});

bookReducer.on(Actions.loadBookToBookRecommendationRequest, (state, action) => {
  const { bookId } = action;
  return {
    ...state,
    [bookId]: {
      ...state[bookId],
      bookToBookRecommendationFetchStatus: FetchStatusFlag.FETCHING,
    },
  };
});

bookReducer.on(Actions.loadBookToBookRecommendationSuccess, (state, action) => {
  const { bookId, recommendedBooks } = action;
  return {
    ...state,
    [bookId]: {
      ...state[bookId],
      bookToBookRecommendationFetchStatus: FetchStatusFlag.IDLE,
      recommendedBooks,
    },
  };
});

bookReducer.on(Actions.loadBookToBookRecommendationFailure, (state, action) => {
  const { bookId } = action;
  return {
    ...state,
    [bookId]: {
      ...state[bookId],
      bookToBookRecommendationFetchStatus: FetchStatusFlag.FETCH_ERROR,
    },
  };
});
