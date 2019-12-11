import * as React from 'react';

import { ArticleChannelFollowButton } from 'app/components/ArticleChannels/ArticleChannelFollowButton';

interface ArticleChannelMetaProps {
  id: number;
  name: string;
  displayName: string;
  thumbnailUrl?: string;
  description?: string;
  subDescription?: string | null;
  followersCount?: number;
  isFollowing?: boolean;
}

export const ArticleChannelMeta: React.FunctionComponent<ArticleChannelMetaProps> = (props) => {
  const {
    id,
    name,
    displayName,
    thumbnailUrl,
    description,
    subDescription,
    followersCount = 0,
  } = props;

  return (
    <section>
      <div className="ArticleChannelMeta_Wrap">
        <div className="ArticleChannel_Thumbnail">
          <img src={thumbnailUrl} className={'ArticleChannel_Image'} />
          <span className="ArticleChannel_ImageShadow" />
        </div>
        <div className="ArticleChannel_Meta">
          <h2 className="ArticleChannel_Meta_Title">{displayName}</h2>
          <p className="ArticleChannel_Meta_Desc">{description}</p>
          <span className="ArticleChannel_Meta_Serial">{subDescription}</span>
          <span className="ArticleChannel_Meta_Following">팔로잉 <strong className="ArticleChannel_Meta_FollowingNumber">{followersCount}</strong></span>
          <ArticleChannelFollowButton
            channelId={id}
            channelName={name}
          />
        </div>
      </div>
    </section>
  );
};
