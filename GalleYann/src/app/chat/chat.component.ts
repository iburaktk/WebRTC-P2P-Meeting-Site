import { Component, OnInit } from '@angular/core';
import { SharedService } from '../shared-service.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages : Array<MessageBlock> = [];
  pressedShift : boolean;

  messageText : string;

  constructor(private _sharedService : SharedService) {
    this.messageText = "";

    _sharedService.changeEmitted$.subscribe(text => {
      let textStr = text as string;
      if (textStr.startsWith("new")) {
        textStr = textStr.substring(4);
        this.messages.unshift(new MessageBlock(textStr, "you", false));
      }
    });
    this.pressedShift = false;
    //this.messages.unshift(new MessageBlock("a\nb\nc","you",false));
   }

  ngOnInit(): void {
    this.messageEnterKeySet();
  }

  public sendMessage() {
    if (this.messageText == "")
      return;
    this._sharedService.emitChange("message "+this.messageText);
    this.messages.unshift(new MessageBlock(this.messageText, "me",true));
    this.messageText = "";
  }

  public uploadFile() {
    this._sharedService.emitChange("file "+this.messageText);
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

class MessageBlock {
  text : string;
  isSent : boolean;
  from : string;
  date : any;

  constructor( text : string, from : string, isSent : boolean) {
    this.text = text;
    this.isSent = isSent;
    this.from = from;
    this.date = new Date().getTime();
  }
}
