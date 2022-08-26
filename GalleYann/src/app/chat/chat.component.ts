import { ViewEncapsulation } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { MessageBlock } from '../app.component';
import { SharedService } from '../shared-service.service';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ChatComponent implements OnInit {
  messages : Array<MessageBlock> = [];
  pressedShift : boolean;
  messageText : string;
  file : any;
  filename : string;

  constructor(private _sharedService : SharedService) {
    this.messageText = "";
    this.filename = "";

    _sharedService.changeEmitted$.subscribe(text => {
      let textStr;
      try {
        textStr = text as string;
        if (typeof textStr == 'string') {
          if (textStr?.startsWith("new")) {
            textStr = textStr.substring(4);
            this.messages.unshift(new MessageBlock(textStr, "Guest", false));
          }
          else if (textStr?.startsWith("requestToSendFile")) {
            var fileDialogBox = document.getElementById('file-download-dialog') || null;
            if (fileDialogBox == null) {
              this.filename = textStr.substring(17);
              console.log("preparing dialog");
              fileDialogBox = document.createElement('div');
              fileDialogBox.classList.add('chat-message');
              fileDialogBox.classList.add('chat-message-received');
              fileDialogBox.style.setProperty("margin","5px 15px 10px 15px")
              fileDialogBox.id = "file-download-dialog";

              const fileNameBox = document.createElement("div");
              fileNameBox.className = "file-name-text";
              fileNameBox.textContent = this.filename;
              const acceptButton = document.createElement('button');
              acceptButton.className = "file-box-button";
              acceptButton.textContent = "Accept";
              acceptButton.onclick = (e)=>{
                this.acceptFile();
                fileDialogBox?.remove();
              };
              const rejectButton = document.createElement('button');
              rejectButton.className = "file-box-button";
              rejectButton.textContent = "Reject";
              rejectButton.onclick = (e)=>{
                fileDialogBox?.remove();
              };
              fileDialogBox.append(fileNameBox);
              fileDialogBox.append(rejectButton);
              fileDialogBox.append(acceptButton);
              const chatHistory = document.getElementById('chat-history') || null;
              if (chatHistory == null)
                throw Error("chat-history element cannot found!");
              chatHistory.prepend(fileDialogBox);
            }
            else {

            }
            const chatHistory = document.getElementById('chat-history') || null;
            if (chatHistory == null)
              throw Error("chat-history element cannot found!");
            chatHistory.prepend(fileDialogBox);
          }
        }
        /*
        else
          console.log(textStr);
          */
      } catch (error : any) {
        console.log(error.message);
      }
    });
    this.pressedShift = false;
   }

  ngOnInit(): void {
    this.messageEnterKeySet();
  }

  public uploadFile()
  {
    var input = document.createElement('input');
    input.type = 'file';

    input.onchange = (e) => {
      // @ts-ignore
      this.file = e.target.files[0];

      if (this.file == null || this.file == undefined)
        throw new Error("Empty file!");
      var reader = new FileReader();
      reader.readAsArrayBuffer(this.file);
      reader.onload = readerEvent => {
        this._sharedService.emitChange("file "+this.file.name);
        var content = readerEvent.target?.result;
        this._sharedService.emitChange(content);
      }
   }
    input.click();
  }

  public acceptFile() {
    this._sharedService.emitChange("acceptFile");
  }

  public sendMessage() {
    if (this.messageText == "")
      return;
    this._sharedService.emitChange("message "+this.messageText);
    this.messages.unshift(new MessageBlock(this.messageText, "Host",true));
    this.messageText = "";
  }

  private messageEnterKeySet() {
    let messageInput = document.getElementById('inputMessage') || null;
    messageInput?.addEventListener("keydown", event => {
      if (event.defaultPrevented) {
        return; // Should do nothing if the default action has been cancelled
      }
      let handled = false;
      if(event.keyCode == 16) // Shift Key
        this.pressedShift = true;
      if(event.keyCode == 13 && !this.pressedShift){ // Enter key
        this.sendMessage();
        handled = true;
      }
      if (handled)
        event.preventDefault();
    })
    messageInput?.addEventListener("keyup", event => {
      if (event.defaultPrevented) {
        return;
      }
      let handled = false;
      if(event.keyCode == 16) {
        this.pressedShift = false;
        handled = true;
      }
      if (handled)
        event.preventDefault();
    })
  }
}
