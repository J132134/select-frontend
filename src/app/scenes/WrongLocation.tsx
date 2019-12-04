import toast from 'app/utils/toast';
import * as React from 'react';

import history from 'app/config/history';
import { RoutePaths } from 'app/constants';

export const WrongLocation: React.FunctionComponent<{ location: Location }> = (props) => {
  React.useEffect(() => {
    toast.failureMessage('입력하신 주소는 없는 페이지입니다.');
    history.replace(props.location.pathname.indexOf('/article') >= 0
      ? RoutePaths.ARTICLE_HOME
      : RoutePaths.HOME,
    );
  });

  return (
    <main className="SceneWrapper" />
  );
};
