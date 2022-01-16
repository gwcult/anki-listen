import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { Configuration, Credentials } from 'src/sync-client';
import { LoginData } from '../login-form/login-form.component';
import { SyncLoginService } from '../sync-login.service';
import { SyncService } from '../sync.service';

@Component({
  selector: 'app-sync-page',
  templateUrl: './sync-page.component.html',
  styleUrls: ['./sync-page.component.scss']
})
export class SyncPageComponent implements OnInit {
  hostKey$ = this.syncLoginService.hostKey$;
  initialLoginData: Partial<LoginData> = { syncUrl: this.apiConfiguration.basePath };
  loading = false;

  constructor(private syncLoginService: SyncLoginService, private syncService: SyncService, private apiConfiguration: Configuration) { }

  ngOnInit(): void {
  }

  onLogInSubmitted(loginData: LoginData) {
    this.loading = true;
    localStorage.setItem('syncUrl', loginData.syncUrl);
    this.apiConfiguration.basePath = loginData.syncUrl;
    this.syncLoginService.logIn(loginData.credentials).pipe(
      finalize(() => { this.loading = false })
    ).subscribe();
  }

  sync() {
    this.loading = true;
    this.syncService.sync()
      .then(res => console.log("syncResult", res))
      .catch(err => console.error(err))
      .finally(() => {
        this.loading = false;
      })
  }
}
