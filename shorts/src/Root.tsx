import './index.css';

import { Composition, staticFile } from 'remotion';

import {
    calculateCaptionedVideoMetadata, CaptionedVideo, captionedVideoSchema
} from './CaptionedVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CaptionedVideo"
      component={CaptionedVideo}
      calculateMetadata={calculateCaptionedVideoMetadata}
      schema={captionedVideoSchema}
      width={1080}
      height={1920}
      defaultProps={{
        src: staticFile("video.mp4"),
      }}
    />
  );
};
