import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginFormComponent } from './sync/login-form/login-form.component';
import { SyncPageComponent } from './sync/sync-page/sync-page.component';
import { NavbarComponent } from './common/navbar/navbar.component';
import { ApiModule, Configuration } from 'src/sync-client';
import { HttpClientModule } from '@angular/common/http';
import { DecksComponent } from './decks/decks.component';
import { DeckPlayComponent } from './deck-play/deck-play.component';

class MySyncApiConfig extends Configuration {
  override processBody(body: any) {
    const form = new FormData();
    for ( const key in body ) {
      form.append(key, body[key]);
    }
    return form;
  }
}

function createApiConfig(): Configuration {
  return new MySyncApiConfig({
    basePath: localStorage.getItem('syncUrl') || 'http://127.0.0.1:8222'
  });
}

@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    SyncPageComponent,
    NavbarComponent,
    DecksComponent,
    DeckPlayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    ApiModule.forRoot(createApiConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
