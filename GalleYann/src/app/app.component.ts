import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { SharedService } from './shared-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  peerIdText = "";

  constructor(private _sharedService: SharedService) {
    _sharedService.changeEmitted$.subscribe(data => {
      try {
        let textStr = data as string;
        if (typeof textStr == 'string') {
          const region = document.getElementById('peerRegion') || null;
          if (textStr.startsWith("id")) {
            textStr = textStr.substring(3);
            this.peerIdText = textStr;
            region?.style.setProperty("display", "inline-flex");
          }
          else if (textStr == "hide")
            region?.style.setProperty("display", "none");
          //else console.log(text);
        }
      } catch (error : any) {
        console.log(error.message);
      }

    });
  }

  public copyClipboard() {
    const pElement = document.getElementById('toolbarText') || null;
    let text = pElement?.textContent ?? "";
    this.copyTextToClipboard(text);
  }

  public copyTextToClipboard(text: string) {
    var txtArea = document.createElement("textarea");
    txtArea.id = 'txt';
    txtArea.style.position = 'fixed';
    txtArea.style.top = '0';
    txtArea.style.left = '0';
    txtArea.style.opacity = '0';
    txtArea.value = text;
    document.body.appendChild(txtArea);
    txtArea.select();

    try {
      document.execCommand('copy');
    } catch (err) {
      console.log('Oops, unable to copy');
    } finally {
      document.body.removeChild(txtArea);
    }
  }
}

export class MessageBlock {
  text! : string;
  isSent! : boolean;
  from! : string;
  date : any;

  constructor( source : MessageBlock );
  constructor( text : string, from : string, isSent : boolean);

  constructor(...myArray : any[]) {
    if (myArray.length == 3) {
      this.text = myArray[0];
      this.from = myArray[1];
      this.isSent = myArray[2];
      this.date = new Date().getTime();
    }
    if (myArray.length == 1) {
      let source = myArray[0] as MessageBlock;
      this.text = source.text;
      this.isSent = source.isSent;
      this.from = source.from;
      this.date = source.date;
    }
  }

  public clone() : MessageBlock {
    let myClone = new MessageBlock(this.text, this.from, this.isSent);
    myClone.date = this.date;
    return myClone;
  }
}
