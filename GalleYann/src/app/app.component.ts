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
        if (typeof textStr != 'string') throw new Error("Not a string, maybe a file?")
        const region = document.getElementById('peerRegion') || null;
        if (textStr.startsWith("id")) {
          textStr = textStr.substring(3);
          this.peerIdText = textStr;
          region?.style.setProperty("display", "inline-flex");
        }
        else if (textStr == "hide")
          region?.style.setProperty("display", "none");
        //else console.log(text);
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
