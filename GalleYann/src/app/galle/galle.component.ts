import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModelService } from '../model-service.service';

@Component({
  selector: 'app-galle',
  templateUrl: './galle.component.html',
  styleUrls: ['./galle.component.css']
})
export class GalleComponent implements OnInit {
  name : string;
  sicil : string;

  constructor(private router : Router,private _modelService : ModelService) {
    this.name = _modelService.name;
    this.sicil = _modelService.sicil;
  }

  ngOnInit(): void {
  }

  createRoom() {
    this.router.navigate(['/host']);
  }

  connect(roomNumber : string) {
    this.router.navigate(['/client',roomNumber]);
  }

}
