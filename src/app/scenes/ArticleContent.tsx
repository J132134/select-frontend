import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import { ArticleContentBottomButtons } from 'app/components/ArticleContent/BottomButtons';
import { ArticleContentComponent } from 'app/components/ArticleContent/ContentComponent';
import { ArticleContentGetTicketToRead } from 'app/components/ArticleContent/GetTicketToRead';
import { ArticleContentHeader } from 'app/components/ArticleContent/Header';
import { FetchStatusFlag } from 'app/constants';
import { Actions } from 'app/services/article';
import { RidiSelectState } from 'app/store';
import { ArticleRequestIncludableData } from 'app/types';

type RouteProps = RouteComponentProps<{ channelName: string; contentIndex: string }>;

type OwnProps = RouteProps & {};

export  const ArticleContent: React.FunctionComponent<OwnProps> = (props) => {
  const { channelName, contentIndex } = props.match.params;
  const contentKey = `@${channelName}/${Number(contentIndex)}`;

  const { articleState, hasAvailableTicket } = useSelector((state: RidiSelectState) => ({
    articleState: state.articlesById[contentKey],
    hasAvailableTicket: state.user.hasAvailableTicket,
  }));
  const dispatch = useDispatch();
  const checkIsFetched = () => {
    return (
      articleState &&
      articleState.contentFetchStatus !== FetchStatusFlag.FETCHING &&
      articleState.contentFetchStatus === FetchStatusFlag.IDLE &&
      articleState.content
    );
  };

  React.useEffect(() => {
    if (checkIsFetched()) {
      return;
    }
    dispatch(Actions.loadArticleRequest({
      channelName,
      contentIndex: Number(contentIndex),
      requestQueries: {
        includes: [
          ArticleRequestIncludableData.CONTENT,
          ArticleRequestIncludableData.AUTHORS,
          ArticleRequestIncludableData.IS_FAVORITE,
          ArticleRequestIncludableData.FAVORITES_COUNT,
        ],
      },
    }));
  }, []);

  return (
    <main className="SceneWrapper PageArticleContent">
      <ArticleContentHeader
        contentKey={contentKey}
      />
      <div className="ArticleContent_ContentWrapper">
        <ArticleContentComponent
          contentKey={contentKey}
        />
        {hasAvailableTicket ? (
          <ArticleContentBottomButtons
            contentKey={contentKey}
          />
        ) : (
          <ArticleContentGetTicketToRead
            contentKey={contentKey}
          />
        )}
      </div>
    </main>
  );
};
