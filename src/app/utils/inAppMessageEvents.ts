import * as PostRobot from 'post-robot';

import { Actions as EnvironmentActions } from 'app/services/environment';
import { store } from 'app/store';
import toast from 'app/utils/toast';

export const setSendPostRobotEvent = () => {
  const inAppInitEventListener = (e: MessageEvent) => {
    const { platform, version } = e.data;
    if (platform && version) {
      window.postRobot = PostRobot;
      window.postMessage({ postRobot: true }, '*');
      store.dispatch(EnvironmentActions.setAppEnvironment({ platform, version }));
    }
  };

  window.addEventListener('message', inAppInitEventListener);
};

export function sendPostRobotInappLogin() {
  if (window.postRobot) {
    window.postRobot
      .send(window, 'inApp', { name: 'onLoginRequired' })
      .catch((err) => {
        toast.failureMessage('앱에서 로그인 후 이용해주세요.');
      });
    return;
  }
  toast.failureMessage('앱에서 로그인 후 이용해주세요.');
}

export function sendPostRobotInitialRendered() {
  if (window.postRobot) {
    window.postRobot
      .send(window, 'inApp', { name: 'initialRendered' });
    return;
  }

  if (window.inApp && window.inApp.initialRendered) {
    window.inApp.initialRendered();
  }
}

export function sendPostRobotMySelectBookDeleted(bookIds: number[]) {
  // 마이셀렉트에서 도서 삭제
  const deleteBookIds = JSON.stringify(bookIds);

  if (window.postRobot) {
    window.postRobot
      .send(window, 'inApp', { name: 'mySelectBookDeleted', args: deleteBookIds })
      .catch((err) => {
        toast.failureMessage('문제가 발생했습니다. 다시 시도해주세요.');
      });
    return;
  }

  if (window.inApp && window.inApp.mySelectBookDeleted) {
    window.inApp.mySelectBookDeleted(JSON.stringify(deleteBookIds));
  } else if (window.android && window.android.mySelectBookDeleted) {
    window.android.mySelectBookDeleted(JSON.stringify(deleteBookIds));
  }
}

export function sendPostRobotMySelectBookInserted(bookId: number) {
  // 마이셀렉트에 도서 추가
  if (window.postRobot) {
    window.postRobot
      .send(window, 'inApp', { name: 'mySelectBookInserted', args: [`${bookId}`] })
      .catch((err) => {
        toast.failureMessage('문제가 발생했습니다. 다시 시도해주세요.');
      });
    return;
  }

  if (window.inApp && window.inApp.mySelectBookInserted) {
    // bookId 를 string 으로 넘겨야 하는 것으로 약속 되어있는데 reducer 내부에서 모두 number로 처리하고 있어서 인앱 관련된 부분 string으로 캐스팅.
    window.inApp.mySelectBookInserted(`${bookId}`);
  } else if (window.android && window.android.mySelectBookInserted) {
    window.android.mySelectBookInserted(`${bookId}`);
  }
}

export function sendPostRobotOpenBrowser(url: string) {
  if (window.postRobot) {
    window.postRobot
      .send(window, 'inApp', { name: 'openBrowser', args: [url] })
      .catch((err) => {
        window.location.href = url;
      });
    return;
  }

  if (window.inApp && window.inApp.openBrowser) {
    window.inApp.openBrowser(url);
    return;
  }

  window.location.href = url;
}
