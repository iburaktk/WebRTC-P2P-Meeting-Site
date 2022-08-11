import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared-service.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(private router : Router, private _sharedService : SharedService) {
    this._sharedService.emitChange("hide");
   }

  ngOnInit(): void {
  }

  saveValue(roomNumber : string) {
    this.router.navigate(['/client',roomNumber]);
  }

}
