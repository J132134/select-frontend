import { MAX_WIDTH } from 'app/constants';
import * as React from 'react';
import MediaQuery from 'react-responsive';
import { ConnectedPageHeader, PageHeaderOwnProps } from './PageHeader';

export const PCPageHeader: React.SFC<PageHeaderOwnProps> = (props) => {
  return (
    <MediaQuery maxWidth={MAX_WIDTH}>
      {(isMobile) => isMobile
        ? <h1 className="a11y">{props.pageTitle}</h1>
        : <ConnectedPageHeader {...props} />
      }
    </MediaQuery>
  );
};
