import { GalleComponent } from './galle/galle.component';
import { GalleLoginComponent } from './galle-login/galle-login.component';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ClientComponent } from './client/client.component';
import { HostComponent } from './host/host.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{path: 'host', component:HostComponent},
	{path: 'client/:id', component:ClientComponent},
	{path: 'guest/:id', component:ClientComponent},
	{path: 'galle/login', component:GalleLoginComponent},
	{path: 'galle', component:GalleComponent},
	{path: '', component:HomeComponent},
	{path: '**', component:PageNotFoundComponent}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
