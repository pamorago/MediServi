import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register.html',
    styleUrl: './register.scss',
})
export class Register {
    registerForm: FormGroup;
    isLoading = signal(false);
    errorMessage = signal('');

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            nombre: ['', Validators.required],
            apellidos: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            telefono: [''],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    onRegister(): void {
        if (!this.registerForm.valid) return;

        this.isLoading.set(true);
        this.errorMessage.set('');

        const data: RegisterRequest = this.registerForm.value;

        this.authService.register(data).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.router.navigate(['/dashboard']);
            },
            error: (error: Error) => {
                this.isLoading.set(false);
                this.errorMessage.set(
                    error?.message || 'Error al registrarse. Intenta de nuevo.'
                );
            },
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.registerForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
}
