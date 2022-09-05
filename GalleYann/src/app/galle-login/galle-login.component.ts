import { ModelService } from './../model-service.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-galle-login',
	templateUrl: './galle-login.component.html',
	styleUrls: ['./galle-login.component.css']
})
export class GalleLoginComponent implements OnInit {
	userDict = new Map<string, string>();
  username : string;
  password : string;

	constructor(private router : Router,private _modelService : ModelService) {
		this.userDict.set("VB12345","İ. Burak Tanrıkulu");
		this.userDict.set("SA12345","Av. Ali Veli");
    this.username = "";
    this.password = "";
	 }

	ngOnInit(): void {
	}

	public giris(sicil : string, password : string ) {
		if (this.userDict.has(sicil)) {
			this._modelService.name = this.userDict.get(sicil) || "";
			this.router.navigate(['/galle']);
		}
	}

}
