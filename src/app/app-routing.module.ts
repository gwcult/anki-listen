import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeckPlayComponent } from './deck-play/deck-play.component';
import { DecksComponent } from './decks/decks.component';
import { SyncPageComponent } from './sync/sync-page/sync-page.component';

const routes: Routes = [
  { path: 'sync', component: SyncPageComponent },
  { path: 'decks/:id', component: DeckPlayComponent },
  { path: 'decks', component: DecksComponent },
  { path: '', redirectTo: 'decks', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
