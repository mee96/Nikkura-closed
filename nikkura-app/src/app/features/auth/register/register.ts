import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html'
})
export class RegisterComponent {

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  error: string | null = null;

  async submit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    try {
      const cred = await this.auth.register(email!, password!);
      console.log('User created:', this.auth.mapUser(cred.user));
    } catch (err: any) {
      this.error = err.message;
    }
  }
}