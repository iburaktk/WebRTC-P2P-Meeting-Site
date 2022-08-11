import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HostComponent } from './host/host.component';
import { ClientComponent } from './client/client.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomeComponent } from './home/home.component';
import { ChatComponent } from './chat/chat.component';

import { AppRoutingModule } from './app-routing.module';


import { FormsModule } from '@angular/forms';

import { SharedService } from './shared-service.service';

@NgModule({
  declarations: [
    AppComponent,
    HostComponent,
    ClientComponent,
    PageNotFoundComponent,
    HomeComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [SharedService],
  bootstrap: [AppComponent]
})
export class AppModule { }
