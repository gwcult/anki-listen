import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Credentials } from 'src/sync-client';

export interface LoginData {
  syncUrl: string;
  credentials: Credentials;
}

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  form = this.fb.group({
    syncUrl: '',
    credentials: this.fb.group({
      u: '',
      p: ''
    })
  });

  @Input() loading = false;
  @Input() set initialData(loginData: Partial<LoginData>) {
    this.form.patchValue(loginData)
  }

  @Output() submitted = new EventEmitter<LoginData>();

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  submit() {
    this.submitted.emit(this.form.value)
  }
}
