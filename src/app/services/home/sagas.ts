import { call, put, select, takeLatest, all } from 'redux-saga/effects';

import { Actions as BookActions } from 'app/services/book';
import { Actions as CollectionActions, ReservedCollectionIds } from 'app/services/collection';
import { CollectionResponse } from 'app/services/collection/requests';
import { homeActions } from 'app/services/home';
import { CollectionIdList } from 'app/services/home/states';
import { HomeResponse, requestHome } from 'app/services/home/requests';
import showMessageForRequestError from 'app/utils/toastHelper';
import { getIsIosInApp } from 'app/services/environment/selectors';
import { ErrorStatus } from 'app/constants/index';
import { isRidiselectUrl } from 'app/utils/regexHelper';
import { ArticleListType } from 'app/services/articleList';

const getCollectionIdList = (collections: CollectionResponse[]) => {
  const collectionIdList: CollectionIdList = collections.map(collection => collection.collectionId);
  // 별점 베스트, 인기 아티클 둘러보기, 인기 도서 콜렉션을 임의의 순서로 추가
  collectionIdList.unshift(ReservedCollectionIds.SPOTLIGHT);
  collectionIdList.splice(2, 0, ArticleListType.POPULAR);
  collectionIdList.splice(4, 0, ReservedCollectionIds.POPULAR);
  return collectionIdList;
};

export function* watchLoadHome() {
  try {
    const { collections, banners }: HomeResponse = yield call(requestHome);
    const books = collections.flatMap(collection => [...collection.books]);
    const isIosInApp: boolean = yield select(getIsIosInApp);
    const bigBannerList = isIosInApp
      ? banners.filter(banner => isRidiselectUrl(banner.linkUrl))
      : banners;

    yield all([
      put(BookActions.updateBooks({ books })),
      put(CollectionActions.updateCollections({ collections })),
      put(
        homeActions.loadHomeSuccess({
          fetchedAt: Date.now(),
          bigBannerList,
          collectionIdList: getCollectionIdList(collections),
        }),
      ),
    ]);
  } catch (error) {
    const data = error.response?.data;
    yield put(homeActions.loadHomeFailure());
    if (!data || data.status !== ErrorStatus.MAINTENANCE) {
      showMessageForRequestError(error);
    }
  }
}

export function* homeRootSaga() {
  yield takeLatest(homeActions.loadHomeRequest.type, watchLoadHome);
}
