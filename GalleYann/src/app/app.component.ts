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
  /*
  public forecasts?: WeatherForecast[];

  http.get<WeatherForecast[]>('/weatherforecast').subscribe(result => {
      this.forecasts = result;
    }, error => console.error(error));

  interface WeatherForecast {
    date: string;
    temperatureC: number;
    temperatureF: number;
    summary: string;
  }
  */

  constructor(private _sharedService: SharedService) {
    _sharedService.changeEmitted$.subscribe(text => {
      let textStr = text as string;
      const region = document.getElementById('peerRegion') || null;
      if (textStr.startsWith("id")) {
        textStr = textStr.substring(3);
        this.peerIdText = textStr;
        region?.style.setProperty("display", "inline-flex");
      }
      else if (textStr == "hide")
        region?.style.setProperty("display", "none");
      //else console.log(text);
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
