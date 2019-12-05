import { ConnectedPageHeader } from 'app/components';
import { ArticleChannelInfoHeader } from 'app/components/ArticleChannels/ArticleChannelInfoHeader';
import { ArticleContentHeaderPlaceholder } from 'app/placeholder/ArticleContentHeaderPlaceholder';
import { selectIsInApp } from 'app/services/environment/selectors';
import { RidiSelectState } from 'app/store';
import * as React from 'react';
import { useSelector } from 'react-redux';

export const ArticleContentHeader: React.FunctionComponent<{ contentKey: string }> = (props) => {
  const { articleState, isInApp } = useSelector((state: RidiSelectState) => ({
    articleState: state.articlesById[props.contentKey],
    isInApp: selectIsInApp(state),
  }));

  if (!articleState || !articleState.article) {
    return <ArticleContentHeaderPlaceholder />;
  }

  return (
    <>
      {isInApp ? <ConnectedPageHeader pageTitle={articleState.article.title} /> : null}
      <h1 className="ArticleContent_Title">{articleState.article.title}</h1>
      <ArticleChannelInfoHeader
        channelId={articleState.article.channelId}
        channelName={articleState.article.channelName}
        contentKey={props.contentKey}
      />
    </>
  );
};
