import { createAction, createReducer } from 'redux-act';

import { FetchErrorFlag, FetchStatusFlag } from 'app/constants';
import { BookDetailResponse, BookDetailResponseV1, BookDetailResponseV2 } from 'app/services/book/requests';
import { RGB } from 'app/services/commonUI';
import { BookId, DateDTO } from 'app/types';
import { AxiosError } from 'axios';

export * from './utils';

export const Actions = {
  initializeBooks: createAction<{
    staticBookState: LocalStorageStaticBookState,
  }>('initializeBooks'),
  updateBooks: createAction<{
    books: Book[],
  }>('updateBooks'),
  loadBookDetailRequest: createAction<{
    bookId: BookId,
  }>('loadBookDetailRequest'),
  loadBookDetailSuccess: createAction<{
    bookId: BookId,
    bookDetail: BookDetailResponse,
  }>('loadBookDetailSuccess'),
  loadBookDetailFailure: createAction<{
    bookId: BookId,
  }>('loadBookDetailFailure'),
  loadBookOwnershipRequest: createAction<{
    bookId: BookId,
  }>('loadBookOwnershipRequest'),
  loadBookOwnershipSuccess: createAction<{
    bookId: BookId,
    ownershipStatus: BookOwnershipStatus,
  }>('loadBookOwnershipSuccess'),
  loadBookOwnershipFailure: createAction<{
    bookId: BookId,
  }>('loadBookOwnershipFailure'),
  clearBookOwnership: createAction<{
    bookIds: BookId[],
  }>('clearBookOwnership'),
  updateDominantColor: createAction<{
    bookId: BookId,
    color: RGB,
  }>('updateDominantColor'),
};

export enum AuthorKeys {
  'author' = 'author',
  'storyWriter' = 'storyWriter',
  'illustrator' = 'illustrator',
  'translator' = 'translator',
  'authorPhoto' = 'authorPhoto',
  'originalAuthor' = 'originalAuthor',
}
export const authorKeys: AuthorKeys[] = [
  AuthorKeys.author,
  AuthorKeys.storyWriter,
  AuthorKeys.illustrator,
  AuthorKeys.translator,
  AuthorKeys.authorPhoto,
  AuthorKeys.originalAuthor,
];
export const authorKoreanNames = {
  [AuthorKeys.author]: '저', // It can be "글, 그림" if the type of book is comic
  [AuthorKeys.storyWriter]: '글',
  [AuthorKeys.illustrator]: '그림',
  [AuthorKeys.translator]: '역',
  [AuthorKeys.authorPhoto]: '사진',
  [AuthorKeys.originalAuthor]: '원작',
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
  isFetched: boolean; // Hmm
  isDetailFetched: boolean;
  detailFetchStatus: FetchStatusFlag;
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
          isDetailFetched: false,
          isFetched: false,
        },
      };
    }, {}),
  };
});

bookReducer.on(Actions.updateBooks, (state, action) => {
  const { books = [] } = action;
  const newState: BookState = books.reduce((prev, book) => {
    prev[book.id] = {
      ...state[book.id],
      isFetched: !!state[book.id] ? state[book.id].isFetched : false,
      isDetailFetched: !!state[book.id] ? state[book.id].isDetailFetched : false,
      detailFetchStatus: !!state[book.id] ? state[book.id].detailFetchStatus : FetchStatusFlag.IDLE,
      ownershipFetchStatus: !!state[book.id] ? state[book.id].ownershipFetchStatus : FetchStatusFlag.IDLE,
      book: !!state[book.id] ? { ...state[book.id].book, ...book } : book,
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
      ownershipFetchStatus: !!state[bookId] ? state[bookId].ownershipFetchStatus : FetchStatusFlag.IDLE,
      isDetailFetched: !!state[bookId] ? state[bookId].isDetailFetched : false,
      isFetched: !!book ? state[bookId].isFetched : false,
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
      isDetailFetched: true,
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
      isDetailFetched: false,
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
  return bookIds.reduce((newState, bookId) => {
    return {
      ...newState,
      [bookId]: {
        ...newState[bookId],
        ownershipStatus: undefined,
      },
    };
  }, state);
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
