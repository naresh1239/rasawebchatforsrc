import React, { PureComponent } from 'react';
import { PROP_TYPES } from 'constants';
import config from '../../../../../../../../config';

import './styles.scss';

class VidReply extends PureComponent {
  constructor(props) {
    super()
    console.log("Vidreply props: ", props)
    console.log("src = ", props.message.get('video'))
  }

  fixUrl(src) {
    if (src.startsWith("http")) {
      return src;
    } else {
      let fixedUrl =  new URL(src, config.MEDIA_ROOT_FIX)
      console.log(src, "->", fixedUrl)
      return fixedUrl.href;
    }
  } 

  componentDidUpdate(prevProps) {
    console.log("In VidReply; prevProps = ", prevProps)
    console.log("In VidReply; props = ", this.props)
  }
  render() {
    return (
      <div className="rw-video">
        <b className="rw-video-title">
          { this.props.message.get('title') }
        </b>
        <div className="rw-video-details">
          <iframe allow="autoplay *; fullscreen *" allowfullscreen="true" src={this.fixUrl(this.props.message.get('video')) + '?rel=0;&autoplay=1'} className="rw-videoFrame" />
        </div>
      </div>
    );
  }
}

VidReply.propTypes = {
  message: PROP_TYPES.VIDREPLY
};

export default VidReply;
