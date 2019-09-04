import * as PostRobot from 'post-robot';

export const setSendPostRobotEvent = () => {
  const inAppInitEventListener = (e: MessageEvent) => {
    const { platform, version } = e.data;
    if (platform && version) {
      window.postRobot = PostRobot;
      window.postMessage({ webReady: true }, '*');
    }
  };

  window.addEventListener('message', inAppInitEventListener);
};
