import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class ModelService {
  private _sicil: string = "";
  private _name: string = "";
  public get sicil(): string {
    return this._sicil;
  }
  public set sicil(value: string) {
    this._sicil = value;
  }
  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    this._name = value;
  }
}
