import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TextareaAutosize from 'react-textarea-autosize';
import Send from 'assets/send_button';
import './style.scss';
import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect as connect2 } from 'extendable-media-recorder-wav-encoder';
import Button from './Button';
import config from './config';

const Sender = ({ sendMessage, inputTextFieldHint, disabledInput, userInput }) => {

  let styles = {
    container: {
      padding: 10,
      margin: 10
    },
    transcribed: {
      border: '1px solid gray',
      backgroundColor: 'lightblue',
      height: 'fit-content',
      padding: '10px',
      width: '30%',
    }
  }

  let mic = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-mic" viewBox="0 0 16 16">
    <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
    <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z" />
  </svg>

  let stopCircle = <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stop-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
  <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z"/>
</svg>

  const [inputValue, setInputValue] = useState('');
  const formRef = useRef('');
  const startRecordButton = { state: "start", name: "", bg: "#d2def9", text: mic };
  const stopRecordButton = { state: "stop", name: "", bg: "lightpink", text: stopCircle };

  let [recordButtonState, setRecordButtonState] = useState(startRecordButton);
  let [audioSetUp, setAudioSetUp] = useState(false);

  let [mediaRecorder, setMediaRecorder] = useState(null);
  let [showLoader, setShowLoader] = useState(false);
  let [transcribedResult, setTranscribedResult] = useState("");

  useEffect(() => {
    
    async function initMediaStream() {
      let port;
      try {
        port = await connect2();

        try {
          await register(port);
        } catch (e2) {
          console.log('E2: ' + e2);
        }
      } catch (e1) {
        console.log('E1: ' + e1);
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let temp = new MediaRecorder(mediaStream, {
        mimeType: 'audio/wav',
        audioBitsPerSecond: 16000,
      });
      setMediaRecorder(temp)

      console.log("Finally mediaRecorder = ", mediaRecorder)
      setAudioSetUp(true);
    }

    initMediaStream();
  }, [])

  async function transcribe(res) {
    setShowLoader(true)
    const form = new FormData();
    let blob = new Blob([res], { type: 'audio/wav' });
    var fileOfBlob = new File([blob], 'aFileName.json');
    form.append("file", fileOfBlob);

    let url = `${config.DOCKSPEECH_BASE}/${config.DOCK_TRANSCRIPTION}/`
    const response = await fetch(url, {
      method: 'POST',
      body: form
    });
    let json = await response.json()
    setShowLoader(false)
    console.log("Response from transcribe:", json)
    // setTranscribedResult(json["transcript"])
    let el = document.getElementsByClassName("rw-new-message")[0]
    el.value = json["transcript"]
    el.focus()
    el.select()
    if (typeof el.selectionStart == "number") {
      el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
      var range = el.createTextRange();
      range.collapse(false);
      range.select();
    }
  }

  // call this function with the recorded blob to
  // download as file
  function download(res) {
    let data = new Blob([res], { type: 'audio/wav' });
    let csvURL = window.URL.createObjectURL(data);
    let tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', 'record.wav');
    tempLink.click();
  }

  async function startRecording() {
    console.log("mediaRecorder is", mediaRecorder)
    try {
      mediaRecorder.start();
    } catch (e) {
      console.log(e);
    }
    mediaRecorder.addEventListener('dataavailable', ({ data }) => {
      transcribe(data); //This method sends the blob data to the server to be processed
    });
  }

  async function stopRecording() {
    try {
      await mediaRecorder?.stop()
    } catch (e) {
      console.log(e);
    }
  }

  let recordClick = () => {
    console.log(recordButtonState)
    if (recordButtonState["state"] == "start") {
      startRecording();
      setRecordButtonState(stopRecordButton)
    } else {
      stopRecording();
      setRecordButtonState(startRecordButton)
    }
  }
  function handleChange(e) {
    setInputValue(e.target.value);
  }

  function handleSubmit(e) {
    sendMessage(e);
    setInputValue('');
  }


  function onEnterPress(e) {
    if (e.keyCode === 13 && e.shiftKey === false) {
      e.preventDefault();
      // by dispatching the event we trigger onSubmit
      // formRef.current.submit() would not trigger onSubmit
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  }
  return (
    userInput === 'hide' ? <div /> : (
      <form ref={formRef} className="rw-sender" onSubmit={handleSubmit}>

        <TextareaAutosize type="text" minRows={1} onKeyDown={onEnterPress} maxRows={3} onChange={handleChange} className="rw-new-message" name="message" placeholder={inputTextFieldHint} disabled={disabledInput || userInput === 'disable'} autoFocus autoComplete="off" />
        <button type="submit" className="rw-send" disabled={!(inputValue && inputValue.length > 0)}>
          <Send className="rw-send-icon" ready={!!(inputValue && inputValue.length > 0)} alt="send" />
        </button>
        <div>
          {showLoader ? <div className='rwa-loader'></div> : <Button name={recordButtonState["name"]} size="lg" bg={recordButtonState["bg"]} text={recordButtonState["text"]} onClick={recordClick} />}
          {/*<div style={styles.transcribed}>{transcribedResult}</div>*/}
        </div>
      </form>));
};
const mapStateToProps = state => ({
  userInput: state.metadata.get('userInput')
});

Sender.propTypes = {
  sendMessage: PropTypes.func,
  inputTextFieldHint: PropTypes.string,
  disabledInput: PropTypes.bool,
  userInput: PropTypes.string
};

export default connect(mapStateToProps)(Sender);
