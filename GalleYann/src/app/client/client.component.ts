import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Peer } from 'peerjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { SharedService } from '../shared-service.service';
import * as FileSaver from 'file-saver';
@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements AfterViewInit {
  private peer: Peer;
  peerIdShare : string;
  private lazyStream: any;
  private connChannel: any;
  private fileConnChannel : any;
  private currentFile : any;
  private fileName : string;
  currentPeer: any;
  private peerList: Array<any> = [];
  mic : boolean;
  cam : boolean;
  screen : boolean;
  isFirst : boolean;
  micImagePath : string;
  camImagePath : string;
  screenImagePath : string;
  screenImageColor : string;
  gridTemplateColumns : string;
  videoWidth : number;
  isChatScreenOpen : boolean;
  isPeopleScreenOpen : boolean;
  sideScreenWidth : number;
  sideDisplay : string;

  constructor(private _Activatedroute:ActivatedRoute, private _sharedService : SharedService) {
    this.peer = new Peer();
    this.mic = true;
    this.cam = true;
    this.screen = false;
    this.isFirst = true;
    this.micImagePath = "assets/MicOn.png";
    this.camImagePath = "assets/CamOn.png";
    this.screenImagePath = "assets/ScreenOff.png";
    this.screenImageColor = "rgb(241, 20, 89)";
    this.gridTemplateColumns = "1fr 1fr";
    this.sideScreenWidth = 0;
    this.videoWidth = window.innerWidth - this.sideScreenWidth - 15;
    this.isChatScreenOpen = false;
    this.isPeopleScreenOpen = false;
    this.sideDisplay = "none";
    this.peerIdShare = "";
    this.fileName = "";

    _sharedService.changeEmitted$.subscribe(data => {
      try {
        let textStr = data as string;
        if (typeof textStr == 'string') {
          if (textStr.startsWith("message")) {
            textStr = textStr.substring(8);
            this.connChannel.send(textStr);
          }
          else if (textStr.startsWith("file")) {
            this.fileConnChannel?.send("name "+textStr.substring(5));
          }
          else if (textStr.startsWith("acceptFile")) {
            this.fileConnChannel?.send("acceptFile");
          }
          else { // id, new, requestToSendFile
            console.log("??? ss else came: "+textStr);
          }
        }
        else
          this.currentFile = data;
      } catch (ex) {
        console.log(ex);
      }
    });
  }

  ngAfterViewInit(): void {
    this._Activatedroute.paramMap.subscribe(params => {
      setTimeout(() => {
        this.peerIdShare = params.get('id') || "";
        // throw ""
        this._sharedService.emitChange("id "+this.peerIdShare);
        this.getPeerId();
        window.addEventListener('resize', this.func);
        this.connectWithPeer();
      });


    });

  }

  func = (resizeEvent : UIEvent) => {
    this.updateScreenPlacement(window.innerHeight);
  };

  getGridSide() : string {
    return "auto " + this.sideScreenWidth + "px";
  }

  public toggleMic() {
    this.mic = ! this.mic;
    for (let index in this.lazyStream.getAudioTracks())
      this.lazyStream.getAudioTracks()[index].enabled = this.mic;
    if (!this.mic)
      this.micImagePath = "assets/MicOff.png";
    else
      this.micImagePath = "assets/MicOn.png";
  }

  public toggleCam() {
    this.cam = ! this.cam;
    for (let index in this.lazyStream.getVideoTracks())
      this.lazyStream.getVideoTracks()[index].enabled = this.cam;
    if (!this.cam)
      this.camImagePath = "assets/CamOff.png";
    else
      this.camImagePath = "assets/CamOn.png";
  }

  public async toggleScreen() {
    this.screen = ! this.screen;
    if (this.screen) {
      this.screenImagePath = "assets/ScreenOn.png"; // cache al
      this.screenImageColor = "rgba(80, 179, 63, 1)";
      this.shareScreen();
    }
    else {
      this.screenImagePath = "assets/ScreenOff.png";
      this.screenImageColor = "rgba(241, 20, 89, 1)";
      this.stopScreenShare();
    }
  }

  public toggleChat() {
    this.isChatScreenOpen = !this.isChatScreenOpen;
    if (this.isChatScreenOpen) {
      this.isPeopleScreenOpen = false;
      this.sideScreenWidth = 300;
      this.sideDisplay = "block";
    }
    else {
      this.sideScreenWidth = 0;
      this.sideDisplay = "none";
    }
    this.updateScreenPlacement(window.innerHeight);
  }

  public togglePeople() {

  }

  public sendMessage(message : string) {
    this.connChannel.send(message);
  }

  private getPeerId = () => {
    /*
    this.peer.on('open', (id) => {
      this.peerId = id;
    });
    */
    /*
    this.peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({
        video: {
          aspectRatio: 16/9
        },
        audio: true
      }).then((stream) => {
        this.lazyStream = stream;
        if (this.isFirst)
        {
          const video = document.createElement('video');
          video.style.setProperty("margin","5px");
          video.classList.add('video');
          video.srcObject = this.lazyStream;
          video.id = "video-0";
          video.className="videoElement";
          video.play();
          const videoElement = document.getElementById('remote-video') || null;
          if (videoElement == null)
            throw Error("Video html element cannot found!");
          video.addEventListener("dblclick", () => {
            video.requestFullscreen().catch((e) => console.log(e));
          });
          // @ts-ignore
          video.disablePictureInPicture = true;
          videoElement.append(video);
          this.isFirst = false;
        }
        call.answer(stream);
        call.on('stream', (remoteStream) => {
          if (!this.peerList.includes(call.peer)) {
            this.currentPeer = call.peerConnection;
            this.peerList.push(call.peer);
            this.streamRemoteVideo(remoteStream);
          }
        });
      }).catch(err => {
        console.log(err + 'Unable to get media');
      });
    });

    this.peer.on('connection', (conn) => {
      this.connChannel = conn;
      conn.send("Hello there!");
      console.log("conn came");
    })
    */
  }

  public connectMessageChannel() {
    var conn = this.peer.connect(this.peerIdShare, {label:"message"});
    this.connChannel = conn;
    conn.on('open', () => {
      conn.on('data', (data) => {
        console.log(data);
        this._sharedService.emitChange("new "+data);
      })
    });
    var fileConn = this.peer.connect(this.peerIdShare, {label:"ftp"});
    this.fileConnChannel = fileConn;
    fileConn.on('open', () => {
      fileConn.on('data', (data) => {
        try {
          let textStr = data as string;
          if (typeof textStr == 'string') {
            if (textStr.startsWith("name")) {
              this.fileName = textStr.substring(5);
              this._sharedService.emitChange("requestToSendFile "+this.fileName);
            }
            else if (textStr.startsWith("acceptFile")) {
              this.fileConnChannel.send(this.currentFile);
            }
          }
          else {
            var myData = data as ArrayBuffer;
            var myBlob = new Blob([new Uint8Array(myData, 0, myData.byteLength)]);
            FileSaver.saveAs(myBlob,this.fileName);
            // successfull to ss for success screen
          }
        } catch (error) {
          console.log(error);
        }

      })
    })
  }


  async connectWithPeer(): Promise<void> {
    if (this.peerIdShare == "")
      throw new Error("Room ID cannot be empty!")
    this.callPeer(this.peerIdShare);
    await new Promise(r => setTimeout(r,1000));
    this.connectMessageChannel();
  }

  private callPeer(id: string): void {
    navigator.mediaDevices.getUserMedia({
      video: {
        aspectRatio: 16/9
      },
      audio: true
    }).then((stream) => {
      this.lazyStream = stream;
      const call = this.peer.call(id, stream);
      call.on('stream', (remoteStream) => {
        if (!this.peerList.includes(call.peer)) {
          this.currentPeer = call.peerConnection;
          this.peerList.push(call.peer);
          if (this.isFirst)
          {
            const video = document.createElement('video');
            video.style.setProperty("margin","5px");
            video.classList.add('video');
            video.srcObject = this.lazyStream;
            video.id = "video-0";
            video.className="videoElement";
            video.play();
            const videoElement = document.getElementById('remote-video') || null;
            if (videoElement == null)
              throw Error("Video html element cannot found!");
            video.addEventListener("dblclick", () => {
              video.requestFullscreen().catch((e) => console.log(e));
            });
            // @ts-ignore
            video.disablePictureInPicture = true;
            videoElement.append(video);
            this.isFirst = false;
          }
          this.streamRemoteVideo(remoteStream);
        }
      });
    }).catch(err => {
      console.log(err + 'Unable to connect');
    });
  }

  private streamRemoteVideo(remoteStream: any): void {
    const video = document.createElement('video');
    video.style.setProperty("margin","5px");
    video.classList.add('video');
    video.srcObject = remoteStream;
    video.className="videoElement";
    video.id = "video-"+this.peerList.length;
    video.play();
    const videoElement = document.getElementById('remote-video') || null;
    if (videoElement == null)
      throw Error("Video html element cannot found!");
    video.addEventListener("dblclick", () => {
      video.requestFullscreen().catch((e) => console.log(e));
    });
    // @ts-ignore
    video.disablePictureInPicture = true;
    videoElement.append(video);
    this.updateScreenPlacement(window.innerHeight);
  }

  public updateScreenPlacement(windowHeight : number) {
    this.videoWidth = window.innerWidth - this.sideScreenWidth - 15;
    windowHeight *= 1.1;
    //console.log("h: "+windowHeight+" h*1.77: "+windowHeight*1.77+" w: "+this.videoWidth +" wiw: "+window.innerWidth);
    let count = this.peerList.length;
    let newHeight = 0;
    switch (count) {
      case 1:
        newHeight = windowHeight / 2;
        if (newHeight * 1.77 > this.videoWidth/2)
          newHeight = this.videoWidth/2/1.8;
        break;
      case 2:
      case 3:
        newHeight = windowHeight / 3;
        if (newHeight * 1.77 > this.videoWidth/2)
          newHeight = this.videoWidth/2/1.8;
        break;
      case 4:
      case 5:
        this.gridTemplateColumns = "1fr 1fr 1fr";
        newHeight = windowHeight / 4;
        if (newHeight * 1.77 > this.videoWidth/3)
          newHeight = this.videoWidth/3/1.8;
        break;
      case 6:
      case 7:
      case 8:
        newHeight = windowHeight / 4.5;
        if (newHeight * 1.77 > this.videoWidth/3)
          newHeight = this.videoWidth/3/1.8;
        break;
      case 9:
      case 10:
      case 11:
        this.gridTemplateColumns = "1fr 1fr 1fr 1fr";
        newHeight = windowHeight / 4.5;
        if (newHeight * 1.77 > this.videoWidth/4)
          newHeight = this.videoWidth/4/1.9;
        break;
      case 12:
      case 13:
      case 14:
        this.gridTemplateColumns = "1fr 1fr 1fr 1fr 1fr";
        newHeight = windowHeight / 4.5;
        if (newHeight * 1.77 > this.videoWidth/5)
          newHeight = this.videoWidth/5/1.9;
        break;
      default:
        break;
    }
    for (let i=0;i<=count;i++) {
      const videoElement = document.getElementById('video-'+i) || null;
      videoElement?.style.setProperty("height",newHeight+"px");
    }
  }

  screenShare(): void {
    this.shareScreen();
  }

  private shareScreen(): void {
    // @ts-ignore
    navigator.mediaDevices.getDisplayMedia().then(stream => {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => {
        this.stopScreenShare();
      };
      // @ts-ignore
      const sender = this.currentPeer.getSenders().find(s => s.track.kind === videoTrack.kind);
      sender.replaceTrack(videoTrack);
      // @ts-ignore
    }).catch(err => {
      console.log('Unable to get display media ' + err);
    });
  }

  private stopScreenShare(): void {
    const videoTrack = this.lazyStream.getVideoTracks()[0];
    // @ts-ignore
    const sender = this.currentPeer.getSenders().find(s => s.track.kind === videoTrack.kind);
    sender.replaceTrack(videoTrack);
  }

}
