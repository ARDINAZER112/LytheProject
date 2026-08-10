import { forwardRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

/**
 * Wraps @hcaptcha/react-hcaptcha with sensible defaults for this app.
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
 * After a successful (or failed) submit, call `captchaRef.current?.resetCaptcha()`
 * so the widget can't be reused for a second request with a stale token.
 */
export const Captcha = forwardRef(function Captcha({ onVerify, onExpire, onError }, ref) {
  if (!SITE_KEY) {
    return (
      <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        VITE_HCAPTCHA_SITE_KEY belum diatur di file .env.local.
      </p>
    );
  }

  return (
    <div className="flex justify-center">
      <HCaptcha
        ref={ref}
        sitekey={SITE_KEY}
        onVerify={onVerify}
        onExpire={onExpire}
        onError={onError}
      />
    </div>
  );
});
