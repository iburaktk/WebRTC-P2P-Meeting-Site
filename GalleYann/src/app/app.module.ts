import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HostComponent } from './host/host.component';
import { ClientComponent } from './client/client.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomeComponent } from './home/home.component';
import { ChatComponent } from './chat/chat.component';
import { GalleComponent } from './galle/galle.component';
import { GalleLoginComponent } from './galle-login/galle-login.component';

import { SharedService } from './shared-service.service';
import { ModelService } from './model-service.service';

@NgModule({
	declarations: [
		AppComponent,
		HostComponent,
		ClientComponent,
		PageNotFoundComponent,
		HomeComponent,
		ChatComponent,
		GalleComponent,
		GalleLoginComponent
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		AppRoutingModule,
		FormsModule
	],
	providers: [SharedService, ModelService],
	bootstrap: [AppComponent]
})
export class AppModule { }
