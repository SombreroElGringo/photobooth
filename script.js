const photobooth = (() => {
  // Fill the photo with an indication that none has been captured.
  const clearOutput = (id) => {
    const takeButton = document.getElementById(`${id}_take`);
    const retakeButton = document.getElementById(`${id}_retake`);
    const saveButton = document.getElementById(`${id}_save`);
    const output = document.getElementById(`${id}_output`);
    let context = output.getContext('2d');
    context.fillStyle = '#AAA';
    context.fillRect(0, 0, output.width, output.height);
    output.setAttribute(
      'class',
      'photobooth__output photobooth__output--hidden'
    );

    takeButton.style.display = 'inline-block';
    retakeButton.style.display = 'none';
    saveButton.style.display = 'none';
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.
  const takePhoto = (id, width, height) => {
    const saveButton = document.getElementById(`${id}_save`);
    const takeButton = document.getElementById(`${id}_take`);
    const retakeButton = document.getElementById(`${id}_retake`);
    const camera = document.getElementById(`${id}_camera`);
    const output = document.getElementById(`${id}_output`);
    let context = output.getContext('2d');
    if (width && height) {
      output.width = width;
      output.height = height;
      context.drawImage(camera, 0, 0, width, height);

      output.setAttribute(
        'class',
        'photobooth__output photobooth__output--display'
      );
      takeButton.style.display = 'none';
      retakeButton.style.display = 'inline-block';
      saveButton.style.display = 'inline-block';
    } else {
      clearOutput();
    }
  }

  const onSuccess = (id) => {
    const takeButton = document.getElementById(`${id}_take`);
    const retakeButton = document.getElementById(`${id}_retake`);
    const saveButton = document.getElementById(`${id}_save`);
    const output = document.getElementById(`${id}_output`);

    let context = output.getContext('2d');
    context.fillStyle = '#AAA';

    takeButton.style.display = 'none';
    retakeButton.style.display = 'none';
    saveButton.style.display = 'none';
    setInfo(id, 'Your photo has been sucessfully saved!');
  }

  const setInfo = (id, message) => {
    const infoDiv = document.getElementById(`${id}_info`);
    const span = document.createElement('span');
    span.innerText = message;
    infoDiv.innerText ='';
    infoDiv.appendChild(span);
  }

  const savePhoto = (id, overlayType) => {
    const output = document.getElementById(`${id}_output`);
    const photoURL = output.toDataURL('image/png');
    if (photoURL) {
      jQuery(document).ready(function(){
        jQuery.ajax({
          method: 'POST',
          url: AjaxObject.url,
          data: {
            photo: photoURL,
            type: overlayType,
            action: 'save_photobooth',
          }
        }).success(() => {
          onSuccess(id);
        }).fail((error) => {
          setInfo(id, 'An error occurred please try again later.');
          console.error(`An error occurred: ${error}`);
        });
      });
    }
  }

  const initializeCamera = (id, overlayType) => {
    let streaming = false; // |streaming| indicates whether or not we're currently streaming
    const width = 320; // We will scale the photo width to this
    const height = 240; // We will scale the photo height to this

    const config = { video: { width: width, height: height, facingMode: "user" }, audio: false }

    const camera = document.getElementById(`${id}_camera`);
    const takeButton = document.getElementById(`${id}_take`);
    const retakeButton = document.getElementById(`${id}_retake`);
    const saveButton = document.getElementById(`${id}_save`);

    navigator.mediaDevices
      .getUserMedia(config)
      .then((stream) => {
        camera.srcObject = stream;
        camera.play();
      })
      .catch((error) => {
        setInfo(id,
          'An error occurred. You must allow your browser to access your camera and you need to refresh the page.'
        );
        takeButton.style.display = 'none';
        console.error(`An error occurred: ${error}`);
      });

    camera.addEventListener(
      'canplay',
      (_event) => {
        if (!streaming) {
          camera.setAttribute('width', width);
          camera.setAttribute('height', height);
          streaming = true;
        }
      }, false);

    takeButton.addEventListener(
      'click',
      (event) => {
        takePhoto(id, width, height);
        event.preventDefault();
      }, false);

    retakeButton.addEventListener(
      'click',
      (event) => {
        clearOutput(id);
        event.preventDefault();
      }, false);

    saveButton.addEventListener(
      'click',
      (event) => {
        savePhoto(id, overlayType);
        event.preventDefault();
      }, false);
    // We make sure the output is clean at the initialization.
    clearOutput(id);
  }

  return {
    initialize: (id, overlayType) => {
      const output = document.getElementById(`${id}_output`);
      const startButton = document.getElementById(`${id}_start`);
      const takeButton = document.getElementById(`${id}_take`);
      const retakeButton = document.getElementById(`${id}_retake`);
      const saveButton = document.getElementById(`${id}_save`);

      // Verify and connect to the camera of the device
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        clearOutput(id);
        if (mobileAndTabletCheck()) {
          takeButton.style.display = 'none';
          startButton.addEventListener(
            'click',
            (event) => {
              initializeCamera(id, overlayType);
              startButton.style.display = 'none';
              event.preventDefault();
            }, false);
        } else {
          startButton.style.display = 'none';
          initializeCamera(id, overlayType);
        }

      } else {
        output.style.display = 'none';
        startButton.style.display = 'none';
        takeButton.style.display = 'none';
        retakeButton.style.display = 'none';
        saveButton.style.display = 'none';
        setInfo(id,
          'Oops! Your browser do not support the camera. Please try via your desktop or a browser supporting the camera.'
        );
      }

    }
  };
})();

const mobileAndTabletCheck = () => {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
