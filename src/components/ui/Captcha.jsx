import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

/**
 * Cloudflare Turnstile CAPTCHA widget.
 *
 * Dipakai di ForgotPassword & ResetPassword — Supabase resetPasswordForEmail()
 * mendukung `captchaToken` Turnstile secara native.
 *
 * Usage:
 *   const captchaRef = useRef(null);
 *   const [captchaToken, setCaptchaToken] = useState('');
 *   ...
 *   <Captcha
 *     ref={captchaRef}
 *     onVerify={setCaptchaToken}
 *     onExpire={() => setCaptchaToken('')}
 *   />
 *
 * Reset setelah submit: captchaRef.current?.resetCaptcha()
 */
export const Captcha = forwardRef(function Captcha(
  { onVerify, onExpire, onError, size = 'normal' },
  ref
) {
  const turnstileRef = useRef(null);

  // Expose resetCaptcha() agar bisa dipanggil dari parent via ref
  useImperativeHandle(ref, () => ({
    resetCaptcha: () => {
      turnstileRef.current?.reset();
    },
  }));

  if (!TURNSTILE_SITE_KEY) {
    return (
      <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        VITE_TURNSTILE_SITE_KEY belum diatur di file .env.
      </p>
    );
  }

  return (
    <div className="flex justify-center">
      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={onVerify}
        onExpire={onExpire}
        onError={onError}
        options={{
          size,
          theme: 'light',
          language: 'id',
        }}
      />
    </div>
  );
});
