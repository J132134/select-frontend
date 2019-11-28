import * as React from 'react';
import { Link } from 'react-router-dom';

import { ArticleChannelFollowButton } from 'app/components/ArticleChannels/ArticleChannelFollowButton';
import { ArticleChannel } from 'app/services/articleChannel';
import { articleChannelToPath } from 'app/utils/toPath';
import { ArticleChannelThumbnail } from './ArticleChannelThumbnail';

export const ArticleChannelsMeta: React.FunctionComponent<ArticleChannel> = (props) => {
  const { id, name, thumbnailUrl, displayName, description } = props;

  return (
    <div className="Channel_Info">
      <ArticleChannelThumbnail
        channelName={name}
        imageUrl={thumbnailUrl}
        linkUrl={articleChannelToPath({ channelName: name })}
      />
      <div className="Channel_Meta">
        <Link className="Channel_Link" to={articleChannelToPath({ channelName: name })}>
          <span className="Channel_Title">{displayName}</span>
        </Link>
        <span className="Channel_Desc">{description}</span>
      </div>
      <ArticleChannelFollowButton
        channelId={id}
        channelName={name}
      />
    </div>
  );
};
