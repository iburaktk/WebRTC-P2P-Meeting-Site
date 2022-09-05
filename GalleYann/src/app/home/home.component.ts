import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModelService } from '../model-service.service';
import { SharedService } from '../shared-service.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  roomID : string;
  name : string;

	constructor(private router : Router, private _sharedService : SharedService, private _modelService : ModelService) {
		this._sharedService.emitChange("hide");
    this.roomID = "";
    this.name = "";
	 }

	ngOnInit(): void {
	}

	goToGalle() {
		this.router.navigate(['/galle/login']);
	}

	connectAsGuest(roomNumber : string, userName : string) {
		this._modelService.name = userName;
		this.router.navigate(['/guest',roomNumber]);
	}

}
