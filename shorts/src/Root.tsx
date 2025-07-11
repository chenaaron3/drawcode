import './index.css';

import { Composition, staticFile } from 'remotion';

import { AutoplayVideo } from './Autoplay';
import {
    calculateCaptionedVideoMetadata, CaptionedVideo, captionedVideoSchema
} from './CaptionedVideo';
import { RawVideo } from './RawVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo}
        calculateMetadata={calculateCaptionedVideoMetadata}
        schema={captionedVideoSchema}
        width={1080}
        height={1920}
        defaultProps={{
          src: staticFile("captioned/video.mp4"),
        }}
      />
      <Composition
        id="AutoplayVideo"
        component={AutoplayVideo}
        calculateMetadata={calculateCaptionedVideoMetadata}
        schema={captionedVideoSchema}
        width={1080}
        height={1920}
        defaultProps={{
          src: staticFile("autoplay/video.mov"),
        }}
      />
      <Composition
        id="RawVideo"
        component={RawVideo}
        calculateMetadata={calculateCaptionedVideoMetadata}
        schema={captionedVideoSchema}
        width={1080}
        height={1920}
        defaultProps={{
          src: staticFile("raw/video.mp4"),
        }}
      />
    </>
  );
};
