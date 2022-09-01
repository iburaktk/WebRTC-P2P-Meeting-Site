import { ModelService } from '../model-service.service';
import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { DataConnection, MediaConnection, Peer } from 'peerjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { SharedService } from '../shared-service.service';
import * as FileSaver from 'file-saver';
import { MessageBlock } from '../app.component';
@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements AfterViewInit {

  //#region Declarations

  private peer: Peer;
  peerId = "";
  roomId : string;
  private myStream: MediaStream;
  private mediaConnMap = new Map<string, MediaConnection>();
  private connChannelMap = new Map<string, DataConnection>();
  private fileConnChannelMap = new Map<string, DataConnection>();
  private currentFile : any;
  private fileName : string;
  private peerList: Array<any> = [];
  private peerConnectionList : Array<RTCPeerConnection> = [];
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

  name : string;

  //#endregion Declarations

  constructor(private _Activatedroute:ActivatedRoute, private _sharedService : SharedService, private _modelService : ModelService) {

    //#region Initial Values

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
    this.roomId = "";
    this.fileName = "";
    this.myStream = new MediaStream();

    this.name = _modelService.name;

    //#endregion Initial Values

    _sharedService.changeEmitted$.subscribe(data => {
      try {
        let textStr = data as string;
        if (typeof textStr == 'string') {
          if (textStr.startsWith("file")) {
            this.sendFileMessage("name "+textStr.substring(5));
          }
          else if (textStr.startsWith("acceptFile")) {
            this.sendFileMessage("acceptFile");
          }
        }
        else {
          let message = data as MessageBlock;
          if (message instanceof MessageBlock && message.from == "Me") {
            let myMessage = message.clone();
            myMessage.isSent = false;
            myMessage.from = this.name;
            this.sendMessage(myMessage);
          }
          else
            this.currentFile = data;
        }
      } catch (ex) {
        console.log(ex);
      }
    });
  }

  ngAfterViewInit(): void {
    this._Activatedroute.paramMap.subscribe(params => {
      setTimeout(() => {
        this.roomId = params.get('id') || "";
        // throw ""
        this._sharedService.emitChange("id "+this.roomId);
        window.addEventListener('resize', this.func);
        this.getPeerId();
        this.connectWithPeer(this.roomId);
      });
    });
  }

  @HostListener("window:beforeunload", ['$event'])
  disconnect(event : Event) {
    /*
    // DataChannel -> message, ftp
    this.connChannelMap.forEach(dataChannel => {
      dataChannel.close();
    });
    this.fileConnChannelMap.forEach(dataChannel => {
      dataChannel.close();
    });

    // MediaStream -> mediaConnections
    this.mediaConnMap.forEach(mediaConnection => {
      mediaConnection.peerConnection.close();
      mediaConnection.close();
    });
    */
    // peer
    this.peerConnectionList.forEach(peerConnection => {
      peerConnection.close();
    });
    this.peer.destroy();
  }

  func = (resizeEvent : UIEvent) => {
    this.updateScreenPlacement(window.innerHeight);
  };

  getGridSide() : string {
    return "auto " + this.sideScreenWidth + "px";
  }

  public toggleMic() {
    this.mic = ! this.mic;
    for (let index in this.myStream.getAudioTracks())
      this.myStream.getAudioTracks()[index].enabled = this.mic;
    if (!this.mic)
      this.micImagePath = "assets/MicOff.png";
    else
      this.micImagePath = "assets/MicOn.png";
  }

  public toggleCam() {
    this.cam = ! this.cam;
    for (let index in this.myStream.getVideoTracks())
      this.myStream.getVideoTracks()[index].enabled = this.cam;
    if (!this.cam)
      this.camImagePath = "assets/CamOff.png";
    else
      this.camImagePath = "assets/CamOn.png";
  }

  public toggleScreen() {
    this.screen = ! this.screen;
    if (this.screen)
      this.shareScreen();
    else
      this.stopScreenShare();
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

  public sendMessage(message : MessageBlock) {
    this.peerList.forEach(peer => {
      this.connChannelMap.get(peer)?.send(message);
    });
  }

  public sendFileMessage(message : any) {
    this.peerList.forEach(peer => {
      this.fileConnChannelMap.get(peer)?.send(message);
    });
  }

  public createHtmlVideo(stream : any, peerID : string) {
    const video = document.createElement('video');
    video.style.setProperty("margin","5px");
    video.classList.add('video');
    video.autoplay = true;
    video.muted = this.peerList.length == 0 ? true : false;
    video.srcObject = stream;
    video.id = "video-"+peerID;
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
    this.updateScreenPlacement(window.innerHeight);
  }

  private getPeerId = () => {
    this.peer.on('open', (id) => {
      this.peerId = id;
    });

    this.peer.on('call', (call) => {
      call.answer(this.myStream);
      this.mediaConnMap.set(call.peer,call);
      call.on('stream', (remoteStream) => {
        if (!this.peerList.includes(call.peer)) {
          this.peerConnectionList.push(call.peerConnection);
          this.peerList.push(call.peer);
          this.createHtmlVideo(remoteStream,call.peer);
        }
      });
    });

    this.peer.on('connection', (conn) => {
      if (conn.label == "message") {
        this.connChannelMap.set(conn.peer,conn);
        conn.on("data", (data) => {
        let message = new MessageBlock(data as MessageBlock);
          this._sharedService.emitChange(message);
        });
      }
      else if (conn.label == "ftp") {
        this.fileConnChannelMap.set(conn.peer,conn);
        conn.on('data', (data) => {
          try {
            let textStr = data as string;
            if (typeof textStr == 'string') {
              if (textStr.startsWith("name")) {
                this.fileName = textStr.substring(5);
                this._sharedService.emitChange("requestToSendFile "+this.fileName);
              }
              else if (textStr.startsWith("acceptFile")) {
                conn.send(this.currentFile);
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
        });
        conn.on("open", () => {
          // do something
        });
      }
    });
  }

  async connectWithPeer(targetPeer : string): Promise<void> {
    if (targetPeer == "")
      throw new Error("Room ID cannot be empty!")
    await this.callPeer(targetPeer);
    await new Promise(r => setTimeout(r,1000));
    this.connectMessageChannel(targetPeer);
  }

  public connectMessageChannel(targetPeer : string) {
    var conn = this.peer.connect(targetPeer, {label:"message"});
    this.connChannelMap.set(targetPeer,conn);
    conn.on('open', () => {
      conn.on('data', (data) => {
        let message = new MessageBlock(data as MessageBlock);
        this._sharedService.emitChange(message);
      });
      conn.on("close", () => {
        this.connChannelMap.delete(conn.peer);
        if (conn.open)
          conn.close();
        console.log(conn.peer+": Message Channel closed!");
      });
    });

    var fileConn = this.peer.connect(targetPeer, {label:"ftp"});
    this.fileConnChannelMap.set(targetPeer,fileConn);
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
              this.sendFileMessage(this.currentFile);
            }
            else if (textStr.startsWith("list")) {
              textStr = textStr.substring(5);
              let list = textStr.split(",");
              list.forEach(peer => {
                if (peer != this.peerId)
                  this.connectWithPeer(peer);
              });
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

      });
      fileConn.on("close", () => {
        this.fileConnChannelMap.delete(fileConn.peer);
        if (fileConn.open)
          fileConn.close();
        console.log(fileConn.peer+": File Channel closed!");
        // Remove vid
        this.peerList.splice(this.peerList.indexOf(fileConn.peer),1);
        let videoElement = document.getElementById('video-'+fileConn.peer) || null;
        videoElement?.remove();
        this.updateScreenPlacement(window.innerHeight);
        console.log(fileConn.peer+": Media Connection closed!");
      });
      fileConn.send("list");
    });
  }

  private async callPeer(targetId: string) {
    if (this.isFirst) {
      await navigator.mediaDevices.getUserMedia({
        video: {
          aspectRatio: 16/9
        },
        audio: true
      }).then((stream) => {
        this.myStream = stream;
        this.createHtmlVideo(this.myStream, this.peerId);
        this.isFirst = false;
      }).catch(err => {
        console.log(err + 'Unable to get media');
      });
    }
    let call = this.peer.call(targetId, this.myStream);
    this.mediaConnMap.set(call.peer,call);
    call.on('stream', (remoteStream) => {
      if (!this.peerList.includes(call.peer)) {
        this.peerConnectionList.push(call.peerConnection);
        this.peerList.push(call.peer);
        this.createHtmlVideo(remoteStream, call.peer);
      }
    });
    call.on("close", () => {
      console.log("Host closed!");
      if (call.open)
        call.close();
    });
  }

  public updateScreenPlacement(windowHeight : number) {
    this.videoWidth = window.innerWidth - this.sideScreenWidth - 15;
    windowHeight *= 1.1;
    let count = this.peerList.length;
    let newHeight = 0;
    switch (count) {
      case 0:
        this.gridTemplateColumns = "1fr";
        newHeight = windowHeight / 1.1;
        if (newHeight * 1.77 > this.videoWidth/1.5)
          newHeight = this.videoWidth/1.5/1.8;
        break;
      case 1:
        this.gridTemplateColumns = "1fr 1fr";
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
    let videoElement = document.getElementById('video-'+this.peerId) || null;
    videoElement?.style.setProperty("height",newHeight+"px");
    this.peerList.forEach(peerID => {
      videoElement = document.getElementById('video-'+peerID) || null;
      videoElement?.style.setProperty("height",newHeight+"px");
    });
  }

  screenShare(): void {
    this.shareScreen();
  }

  private shareScreen(): void {
    // @ts-ignore
    navigator.mediaDevices.getDisplayMedia().then(stream => {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.onended = () => {
        if (this.screen)
          this.toggleScreen();
      };
      this.peerConnectionList.forEach( (peer) => {
        // @ts-ignore
        const sender = peer.getSenders().find(s => s.track.kind === videoTrack.kind);
        // @ts-ignore
        sender.replaceTrack(videoTrack);
      });

      const videoElement = document.getElementById('video-0') || null;
      // @ts-ignore
      videoElement.srcObject = new MediaStream([videoTrack]);

      this.screenImagePath = "assets/ScreenOn.png"; // cache al
      this.screenImageColor = "rgba(80, 179, 63, 1)";
      // @ts-ignore
    }).catch(err => {
      console.log('Unable to get display media ' + err);
    });
  }

  private stopScreenShare(): void {
    this.screenImagePath = "assets/ScreenOff.png";
    this.screenImageColor = "rgba(241, 20, 89, 1)";

    const videoTrack = this.myStream.getVideoTracks()[0];
    this.peerConnectionList.forEach( (peer) => {
      // @ts-ignore
      const sender = peer.getSenders().find(s => s.track.kind === videoTrack.kind);
      sender?.track?.stop();
      sender?.track?.dispatchEvent(new Event("ended"));
      // @ts-ignore
      sender.replaceTrack(videoTrack);
    });

    const videoElement = document.getElementById('video-0') || null;
      // @ts-ignore
      videoElement.srcObject = new MediaStream([videoTrack]);
  }
}
