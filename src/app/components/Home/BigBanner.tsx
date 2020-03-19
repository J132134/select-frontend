import styled from '@emotion/styled';
import React from 'react';
import { useSelector } from 'react-redux';

import { RidiSelectState } from 'app/store';
import { AppStatus } from 'app/services/app';
import { getBooksBannerCurrentIdx, getArticlesBannerCurrentIdx } from 'app/services/home/selectors';
import TopBannerCarousel, { IMAGE_WIDTH, TopBannerCarouselProps } from 'app/components/TopBanner';
import { getSectionStringForTracking } from 'app/services/tracking/utils';

const TopBannerSkeleton = styled.div`
  width: 100%;
  height: 100vw;
  max-height: ${IMAGE_WIDTH}px;
  background: #eee;
`;

const BookCarousel: React.FunctionComponent<TopBannerCarouselProps> = props => (
  <TopBannerCarousel {...props} />
);

const ArticlesCarousel: React.FunctionComponent<TopBannerCarouselProps> = props => (
  <TopBannerCarousel {...props} />
);

const BigBanner: React.FunctionComponent = () => {
  const { appStatus } = useSelector((state: RidiSelectState) => state.app);
  const fetchedAt = useSelector((state: RidiSelectState) =>
    appStatus === AppStatus.Books ? state.home.fetchedAt : state.articleHome.fetchedAt,
  );
  const savedIdx =
    appStatus === AppStatus.Books
      ? useSelector(getBooksBannerCurrentIdx)
      : useSelector(getArticlesBannerCurrentIdx);
  const service = appStatus === AppStatus.Books ? 'select-book' : 'select-article';
  const section = getSectionStringForTracking(service, 'home', 'big-banner');
  const bigBannerList = useSelector((state: RidiSelectState) =>
    appStatus === AppStatus.Books ? state.home.bigBannerList : state.articleHome.bigBannerList,
  );
  const banners = bigBannerList.map(bannerItem => ({
    id: bannerItem.id,
    landing_url: bannerItem.linkUrl,
    main_image_url: bannerItem.imageUrl,
    title: bannerItem.title,
  }));
  if (!fetchedAt) {
    return <TopBannerSkeleton />;
  }
  return appStatus === AppStatus.Books ? (
    <BookCarousel banners={banners} appStatus={appStatus} section={section} savedIdx={savedIdx} />
  ) : (
    <ArticlesCarousel
      banners={banners}
      appStatus={appStatus}
      section={section}
      savedIdx={savedIdx}
    />
  );
};

export default BigBanner;
